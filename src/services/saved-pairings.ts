import PoolController from '../controllers/pool.js'

const poolController = new PoolController("user_data")

export class SavedPairings {
    static async insertPairing (dish: string, uId: number, wine: string, pairing: JSON) {
        const insertRes = await poolController.query(
            `
            DO
            $do$
            BEGIN
                IF EXISTS (SELECT user_id FROM user_account_data WHERE user_id=${uId}) THEN
                    IF NOT EXISTS (SELECT saved_pairings
                        FROM user_account_data
                        WHERE user_id = ${uId}
                        AND EXISTS (SELECT * FROM jsonb_array_elements(saved_pairings) as r(pairing)
                            WHERE (pairing ->> 'dish')::text = '${dish}'
                            AND (pairing ->> 'wine_name')::text = '${wine}'))
                        THEN UPDATE user_account_data SET saved_pairings = saved_pairings || 
                            '${JSON.stringify(pairing)}' ::jsonb
                            WHERE user_id = ${uId};
                    ELSE RAISE NOTICE 'Pairing already saved';
                    END IF;
                ELSE
                    INSERT INTO user_account_data(saved_pairings, user_id) VALUES (
                    '[${JSON.stringify(pairing)}]' ::jsonb, ${uId});
                END IF;
            END
            $do$
            `
        )
        return insertRes
    }

    static async isPairingSaved(pairing: any, uId: number): Promise<boolean> {
        const { rows } = await poolController.query(
            `
            SELECT EXISTS (SELECT saved_pairings
                FROM user_account_data
                WHERE user_id = ${uId}
                AND EXISTS (SELECT * FROM jsonb_array_elements(saved_pairings) as r(pairing)
                    WHERE (pairing ->> 'dish')::text = '${pairing.dish}'
                    AND (pairing ->> 'wine_name')::text = '${pairing.wine_name}'))
            `
        )
        return rows[0].exists
    }

    static async updateSavedPairings(uId: number, newPairingList: Array<any>) {
        const { rows } = await poolController.query(`
            UPDATE user_account_data SET saved_pairings = '${JSON.stringify(newPairingList)}' ::jsonb
            WHERE user_id = ${uId} RETURNING saved_pairings;
        `)
        return rows[0].saved_pairings
    }
}
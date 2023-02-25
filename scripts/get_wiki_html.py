from bs4 import BeautifulSoup as BS
import requests
from unidecode import unidecode
from urllib.parse import unquote
import urllib.request
import json
import os



# open a connection to a URL using urllib
webUrl  = urllib.request.urlopen('https://en.wikipedia.org/wiki/Abbuoto')

#get the result code and print it
wikiHtml = webUrl.read()

newSoup = BS(wikiHtml)

#selection
tableElems = newSoup.findAll('img')

for image in tableElems:
    if 'upload' in image['src']:
        img = image['src'].replace('//', '')

        print(img)
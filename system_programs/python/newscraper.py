# web scraper for the Metropolitan Open Collection.
#
#Default is showing front page results and only artworks with images.
#By default also return only artworks with images and return based on relevance.
#Also creates a json document with basic information
#Return a default of 6 images.
#
#Takes on multiple optional options
# - Artist name: String in quotes, single or double
# - Quantity: Number of images to scrape (default: 6)
# - NoJSON: Boolean (default: false)

import argparse
import string

parser = argparse.ArgumentParser()
parser.add_argument("artist", help="Name of the artist", nargs='?')
parser.add_argument("-nj", "--nojson", help="Do not create a json file for each artwork", action="store_true")
parser.add_argument("-q", "--quantity", help="Number of images to scrape", type=int);
args = parser.parse_args()

createJson = True
quantity = 6
artist = ""
if args.nojson:
	createJson = False
if args.quantity: 
	quantity = args.quantity
if args.artist:
	artist = args.artist.replace(' ','+')

main_url = 'www.metmuseum.org/art/collection'


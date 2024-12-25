import requests
from bs4 import BeautifulSoup
import csv

# Replace the URL with the actual URL of the website you want to scrape
url = 'https://tazz.ro/cluj-napoca/restaurante'
response = requests.get(url)

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
 
    # Open a CSV file for writing
    with open('tazzRestaurants.csv', 'w', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['ID', 'Restaurant Name', 'Restaurant Img Src', 'Restaurant Discount', 'Restaurant Link'])

        # Find all store cards
        store_cards = soup.find_all('div', class_='store-card')

        for i, card in enumerate(store_cards, start=1):
            # Extract relevant information from each store card
            restaurant_link = card.find('a', class_='image-container')['href']
            restaurant_name = card.find('h3', class_='store-name').text.strip()
            restaurant_img_src = card.find('img', class_='logo-cover')['src']
            
            # Check if there is a discount ribbon
            discount_ribbon = card.find('div', class_='ribbon')
            restaurant_discount = discount_ribbon.text.strip() if discount_ribbon else ''

            # Write the information to the CSV file
            csv_writer.writerow([
                i,  # ID starting from 1
                restaurant_name,
                restaurant_img_src,
                restaurant_discount,
                restaurant_link
            ])
else:
    print(f'Error: Unable to fetch the webpage. Status code: {response.status_code}')

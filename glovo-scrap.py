import csv
import requests
from bs4 import BeautifulSoup

# Base URL of the website you want to scrape
base_url = 'https://glovoapp.com/ro/ro/cluj-napoca/restaurante_1/'

# Open CSV file for writing
with open('glovoRestaurants.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)

    # Write header row
    writer.writerow(['ID', 'Restaurant Name', 'Image Source', 'Discount', 'Restaurant Link'])

    # Initialize total count
    total_count = 0

    # Loop through pages 1 to 9
    for page_number in range(1, 10):
        # Construct the URL for each page
        url = f'{base_url}?page={page_number}'

        # Fetch HTML content from the URL
        response = requests.get(url)
        html = response.content

        # Create BeautifulSoup object
        soup = BeautifulSoup(html, 'html.parser')

        # Find all store cards and loop through them
        for store_card in soup.find_all('a', class_='store-card'):
            # Increment the total count
            total_count += 1

            # Get restaurant name, image source, and discount
            restaurant_name = store_card.find('h3', class_='store-card__footer__title').text.strip()
            image_src = store_card.find('img', class_='store-card__image__inner')['src']
            discount_tag = store_card.find('div', class_='store-card-promo__title')
            discount = discount_tag.text.strip() if discount_tag else ''

            # Get restaurant link
            restaurant_link = "https://glovoapp.com" + store_card['href']

            # Write data to CSV with the total count
            writer.writerow([total_count, restaurant_name, image_src, discount, restaurant_link])

print("Scraping completed. Check 'glovoRestaurants.csv' for the results.")

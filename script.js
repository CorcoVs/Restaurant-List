document.addEventListener("DOMContentLoaded", function () {
  // Function to populate the table from a CSV file
  const populateTable = (tableId, tableContainerId, csvFile) => {
    const tableContainer = document.getElementById(tableContainerId);

    // Fetch the CSV file
    fetch(csvFile)
      .then((response) => response.text())
      .then((data) => {
        // Parse CSV data
        const rows = data.split("\n");

        // Clear existing table content
        document.querySelector(`#${tableId} tbody`).innerHTML = "";

        // Iterate through rows and populate the table
        for (let i = 1; i < rows.length; i++) {
          const columns = rows[i].split(",");

          // Create a table row
          const row = document.createElement("tr");

          // Populate the row with data
          for (let j = 0; j < columns.length; j++) {
            // Skip rendering the last column (link) in the table
            if (j === columns.length - 1) continue;

            const cell = document.createElement("td");

            // If the current column is for restaurant name, create an anchor element
            if (j === 1) {
              const restaurantLink = document.createElement("a");
              restaurantLink.href = columns[columns.length - 1]; // Assuming the link is the last column
              restaurantLink.textContent = columns[j];
              cell.appendChild(restaurantLink);
            }
            // If the current column is for images, create an img element
            else if (j === 2) {
              const img = document.createElement("img");
              img.dataset.src = columns[j]; // Use data-src attribute for lazy-loading
              img.alt = "Restaurant Image";
              img.style.maxWidth = "100px"; // Set a maximum width for the image
              cell.appendChild(img);
            } else {
              cell.textContent = columns[j];
            }

            row.appendChild(cell);
          }

          // Append the row to the table body
          document.querySelector(`#${tableId} tbody`).appendChild(row);
        }

        // Lazy-load images as the user scrolls
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src; // Set the src attribute to start loading the image
              observer.unobserve(img); // Stop observing once loaded
            }
          });
        });

        // Select all images with data-src attribute
        document
          .querySelectorAll(`#${tableId} img[data-src]`)
          .forEach((img) => {
            observer.observe(img);
          });

        tableContainer.style.overflowY = "auto";
        tableContainer.style.maxHeight = "67vh"; // Adjust the maximum table height
      })
      .catch((error) => console.error("Error fetching CSV file:", error));
  };

  // Populate Glovo table
  populateTable("glovoTable", "glovoTableContainer", "glovoRestaurants.csv");

  // Populate Tazz table
  populateTable("tazzTable", "tazzTableContainer", "tazzRestaurants.csv");
});
// Search functionality
const searchInput = document.querySelector("[data-search]");

// Listen for input events to filter the table
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  // Select all restaurant name cells in both tables
  const restaurantNameCells = document.querySelectorAll(
    "#glovoTable tbody tr td:nth-child(2), #tazzTable tbody tr td:nth-child(2)"
  );

  // Iterate through each restaurant name cell and toggle visibility based on the search term
  restaurantNameCells.forEach((cell) => {
    const restaurantName = cell.textContent.toLowerCase();
    cell.parentNode.style.display = restaurantName.includes(searchTerm)
      ? ""
      : "none";
  });
});

// Function to scroll to the top of the page
document.addEventListener("DOMContentLoaded", function () {
  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Check the screen width and show the scroll-to-top button accordingly
  const checkScreenWidth = () => {
    const screenWidth = window.innerWidth;

    // Adjust the threshold according to your needs (695px in this case)
    const thresholdWidth = 695;

    if (screenWidth > thresholdWidth) {
      scrollToTop();
    }
  };

  // Call the checkScreenWidth function when the page loads
  checkScreenWidth();

  // Listen for resize events to check the screen width dynamically
  window.addEventListener("resize", checkScreenWidth);
});

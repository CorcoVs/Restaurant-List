document.addEventListener("DOMContentLoaded", function () {
  // Function to parse CSV data
  const parseCSV = (csvData) => {
    // Split the CSV data into rows
    const rows = csvData.split("\n");

    // Filter out empty lines
    const nonEmptyRows = rows.filter((row) => row.trim() !== "");

    // Initialize an array to store parsed data
    const parsedData = nonEmptyRows.map((row) => {
      // Split each row into columns
      const columns = row.split(",");

      // Create an object with column headers as keys
      return {
        id: columns[0],
        name: columns[1],
        image: columns[2],
        discount: columns[3],
        link: columns[4],
      };
    });

    return parsedData;
  };

  // Lazy-load images as the user scrolls
  const lazyLoadImages = (tableId) => {
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
    document.querySelectorAll(`#${tableId} img[data-src]`).forEach((img) => {
      observer.observe(img);
    });
  };

  // Function to combine data from Tazz and Glovo CSVs based on matching restaurant names
  const combineData = (dataArray) => {
    const tazzData = parseCSV(dataArray[0]);
    const glovoData = parseCSV(dataArray[1]);

    // Combine data from both Tazz and Glovo
    const combinedData = [];

    // Add Tazz restaurants to the combined data
    tazzData.forEach((tazzRow) => {
      const matchingGlovoRow = glovoData.find(
        (glovoRow) => glovoRow.name.toLowerCase() === tazzRow.name.toLowerCase()
      );

      combinedData.push({
        id: tazzRow.id,
        name: tazzRow.name,
        image: tazzRow.image,
        link: tazzRow.link,
        tazz: tazzRow.discount
          ? `<a href="${tazzRow.link}" target="_blank">${tazzRow.discount}</a>`
          : "Visit",
        glovo: matchingGlovoRow
          ? `<a href="${matchingGlovoRow.link}" target="_blank">${
              matchingGlovoRow.discount || "Visit"
            }</a>`
          : "N/A",
      });
    });

    // Add Glovo restaurants not present in Tazz to the combined data
    glovoData.forEach((glovoRow) => {
      const isAlreadyAdded = combinedData.some(
        (row) => row.name.toLowerCase() === glovoRow.name.toLowerCase()
      );

      if (!isAlreadyAdded) {
        combinedData.push({
          id: glovoRow.id,
          name: glovoRow.name,
          image: glovoRow.image,
          link: glovoRow.link,
          tazz: "N/A",
          glovo: `<a href="${glovoRow.link}" target="_blank">${
            glovoRow.discount || "Visit"
          }</a>`,
        });
      }
    });

    return combinedData;
  };

  // Function to populate the combined table
  const populateCombinedTable = (combinedData) => {
    const tableBody = document.querySelector("#combinedTable tbody");

    // Clear existing table content
    tableBody.innerHTML = "";

    // Iterate through combined data and populate the table
    combinedData.forEach((row, index) => {
      const tableRow = document.createElement("tr");

      // Populate the row with data
      for (const key in row) {
        const cell = document.createElement("td");

        // If the key is "link" or "image", hide the cell
        if (key === "link") {
          cell.style.display = "none";
        }

        // If the key is "discount" and it contains a link, create an anchor element
        if (key === "discount" && row[key].includes("<a href=")) {
          const link = document.createElement("a");
          link.href = row["link"];
          link.target = "_blank";
          link.innerHTML = row[key];

          // Append the link element to the cell
          cell.appendChild(link);
        } else {
          // Set the content of the cell
          cell.innerHTML =
            key === "image"
              ? `<img src="${row[key]}" alt="Restaurant Image" loading="lazy" style="max-width: 100px;">`
              : row[key];
        }

        tableRow.appendChild(cell);
      }

      tableBody.appendChild(tableRow);

      // Hide the first row (header) after populating the table
      if (index === 0) {
        tableRow.style.display = "none";
      }
    });

    // Call lazyLoadImages to start lazy loading images
    lazyLoadImages("combinedTable");
  };

  // Fetch and combine CSV data
  Promise.all([
    fetch("tazzRestaurants.csv").then((response) => response.text()),
    fetch("glovoRestaurants.csv").then((response) => response.text()),
  ])
    .then(combineData)
    .then(populateCombinedTable)
    .catch((error) => console.error("Error fetching CSV files:", error));
});

document.getElementById("updateCSV").onclick = () => {
  fetch(
    "https://api.github.com/repos/CorcoVs/Restaurant-List/actions/workflows/manual_scrape.yml/dispatches",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.everest-preview+json",
        Authorization:
          "Bearer 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",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  ).then((response) => {
    if (response.ok) {
      alert("CSV update initiated!");
    } else {
      alert("Failed to trigger update. Check console for errors.");
      console.error(response);
    }
  });
};

// Search functionality
const searchInput = document.querySelector("[data-search]");
let debounceTimer;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const searchTerm = e.target.value.toLowerCase();
    const restaurantNameCells = document.querySelectorAll(
      "#combinedTable tbody tr td:nth-child(2)"
    );
    restaurantNameCells.forEach((cell) => {
      const restaurantName = cell.textContent.toLowerCase();
      cell.parentNode.style.display = restaurantName.includes(searchTerm)
        ? ""
        : "none";
    });
  }, 300);
});

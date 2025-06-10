// Import necessary modules
const express = require('express'); // Express.js for handling routes
const bodyParser = require('body-parser'); // Middleware to parse JSON request bodies
const fs = require('fs'); // Node.js built-in file system module
const path = require('path'); // Node.js built-in path module for handling file paths

// Initialize Express app
const app = express();
const PORT = 5500; // Define the port your server will listen on.

// Middleware setup
// Use body-parser to parse JSON requests. Limit size to 50mb for larger form submissions.
app.use(bodyParser.json({ limit: '50mb' }));

// Set the base directory for static files (where your HTML, CSS, JS, assets are)
// IMPORTANT CHANGE: frontendPath is now __dirname, assuming server.js is directly
// inside the 'alagang-sinta' directory, making it the main repository root.
const frontendPath = __dirname; 

// DIAGNOSTIC LOG: Confirm where the server is trying to serve files from
console.log(`Frontend static files expected to be served from: ${frontendPath}`);
app.use(express.static(frontendPath));

// Middleware for CORS (already present and good for development)
app.use((req, res, next) => {
    // Allow requests from your frontend's origin (e.g., http://localhost:8080 or file://)
    // For development, '*' is often used, but for production, specify your exact frontend URL.
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Define the directory where submission data will be stored
// IMPORTANT CHANGE: submissionsDir is now directly within the 'alagang-sinta' folder
// (alongside server.js)
const submissionsDir = path.join(__dirname, 'submissions');

// Ensure the submissions directory exists
if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir);
    console.log(`Created submissions directory: ${submissionsDir}`);
}

// Function to get the next incrementing ID
// This is a simple file-based counter. In a real application, you'd use a database
// for more robust ID management (e.g., auto-incrementing primary keys).
let nextId = 1; // Start from 1

// Try to read the last ID from a file or by counting existing submission folders
function initializeNextId() {
    try {
        const existingFolders = fs.readdirSync(submissionsDir, { withFileTypes: true })
                                  .filter(dirent => dirent.isDirectory())
                                  .map(dirent => parseInt(dirent.name, 10)) // Attempt to parse folder names as IDs
                                  .filter(id => !isNaN(id)); // Filter out non-numeric folder names
        if (existingFolders.length > 0) {
            nextId = Math.max(...existingFolders) + 1;
            console.log(`Initialized nextId to: ${nextId} based on existing submissions.`);
        }
    } catch (error) {
        console.error("Error initializing nextId:", error);
    }
}
initializeNextId(); // Call once on server start

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    // DIAGNOSTIC LOG: Confirm if this route is being hit
    console.log('GET / route hit. Attempting to serve index.html from:', path.join(frontendPath, 'index.html'));
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Serve the application-form.html file when its specific URL is accessed
app.get('/pages/application-form.html', (req, res) => {
    // DIAGNOSTIC LOG: Confirm if this route is being hit
    console.log('GET /pages/application-form.html route hit. Attempting to serve application-form.html from:', path.join(frontendPath, 'pages', 'application-form.html'));
    res.sendFile(path.join(frontendPath, 'pages', 'application-form.html'));
});


// API endpoint for form submission
app.post('/submit-application', (req, res) => {
    // Get the form data from the request body
    const formData = req.body;

    // Assign the incrementing ID and current timestamp
    const submissionId = nextId++; // Assign current ID and then increment for next time
    formData.applicationId = submissionId; // Overwrite or add the backend-generated ID
    formData.submissionTimestamp = new Date().toISOString();

    // Create a unique folder for this submission using the new ID
    const submissionFolder = path.join(submissionsDir, String(submissionId));

    // Check if folder exists, if not create it
    if (!fs.existsSync(submissionFolder)) {
        try {
            fs.mkdirSync(submissionFolder, { recursive: true });
            console.log(`Created folder for submission ID ${submissionId}: ${submissionFolder}`);
        } catch (error) {
            console.error(`Error creating folder for submission ID ${submissionId}:`, error);
            return res.status(500).json({ message: 'Error creating submission folder.' });
        }
    }

    // Define the file path for the JSON data within the submission folder
    const filePath = path.join(submissionFolder, 'application_data.json');

    // Write the form data to a JSON file
    fs.writeFile(filePath, JSON.stringify(formData, null, 2), (err) => {
        if (err) {
            console.error('Error saving form data:', err);
            return res.status(500).json({ message: 'Failed to save application data.' });
        }
        console.log(`Application data for ID ${submissionId} saved to ${filePath}`);
        // Send a success response back to the client
        res.status(200).json({
            message: 'Application submitted successfully!',
            applicationId: submissionId,
            filePath: filePath
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT} or http://localhost:${PORT}`);
    console.log(`Submissions will be saved in: ${submissionsDir}`);
});

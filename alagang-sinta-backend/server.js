// server.js
// This file sets up a Node.js server using Express to handle API requests
// and interact with a MySQL database for CRUD operations on 'applications'.

// 1. Import necessary modules
const express = require('express'); // Express.js framework for building web applications
const mysql = require('mysql2/promise'); // MySQL client for Node.js with Promise API
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing (CORS)
const path = require('path'); // Node.js path module for working with file paths
const userController = require('./controllers/userController');

// 2. Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000; // Define the port for the server to listen on

// 3. Configure middleware
app.use(cors()); // Enable CORS for all routes, allowing your frontend to make requests
app.use(bodyParser.json()); // Parse incoming JSON request bodies

// Serve static files from the 'public' directory
// This allows your HTML, CSS, and client-side JavaScript to be accessed by the browser.
app.use(express.static(path.join(__dirname,'../', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));


// 4. MySQL Database Connection Pool Configuration
// It's recommended to use a connection pool for better performance and resource management
const pool = mysql.createPool({
    host: 'localhost', // Your MySQL host (e.g., 'localhost' or an IP address)
    user: 'root', // Your MySQL username
    password: 'infoman', // Your MySQL password
    database: 'alagang_sinta', // The name of your MySQL database
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // No limit for queued requests
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database!');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.message);
        console.error('Please ensure MySQL is running and credentials are correct.');
    });

// 5. Define API Routes

// Helper function to handle database queries
async function executeQuery(sql, params = []) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (err) {
        console.error("Database query error:", err.message);
        throw err; // Re-throw the error to be caught by the route handler
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
}

// API Route for User Login
app.post('/api/login', userController);

// --- API Route for CREATE (POST /api/applications) ---
// Handles new application submissions
app.post('/api/applications', async (req, res) => {
    // Extract data from the request body
    const { applicant, members, currentPets, pastPets } = req.body;

    // Basic validation (more robust validation should be added)
    if (!applicant || !applicant.username || !applicant.password || !applicant.fullName) {
        return res.status(400).json({ message: 'Missing required applicant information.' });
    }

    try {
        // Start a transaction to ensure atomicity for complex inserts
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        let applicationId;

        try {
            // Insert into 'applicants' table
            const applicantSql = `
                INSERT INTO applicants (
                    username, password, full_name, age, nationality, address,
                    telephone, mobile_number, email_address, occupation,
                    residence_type, ownership_type, allowed_pets, child_behave,
                    permission_to_visit
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [applicantResult] = await connection.execute(applicantSql, [
                applicant.username, applicant.password, applicant.fullName, applicant.age,
                applicant.nationality, applicant.address, applicant.telephone,
                applicant.mobileNumber, applicant.emailAddress, applicant.occupation,
                applicant.residenceType, applicant.ownershipType, applicant.allowedPets,
                applicant.childBehave, applicant.permissionToVisit
            ]);
            applicationId = applicantResult.insertId; // Get the ID of the newly inserted applicant

            // Insert household members
            if (members && members.length > 0) {
                for (const member of members) {
                    const memberSql = `
                        INSERT INTO household_members (
                            applicant_id, name, relationship, age, has_allergies, supports_adoption
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(memberSql, [
                        applicationId, member.name, member.relationship, member.age,
                        member.hasAllergies, member.supportsAdoption
                    ]);
                }
            }

            // Insert current pets
            if (currentPets && currentPets.length > 0) {
                for (const pet of currentPets) {
                    const currentPetSql = `
                        INSERT INTO current_pets (
                            applicant_id, species, age, gender, is_rescued, is_neutered_spayed,
                            is_bred, vet_name, vet_contact
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(currentPetSql, [
                        applicationId, pet.species, pet.age, pet.gender, pet.isRescued,
                        pet.isNeuteredSpayed, pet.isBred, pet.vetName, pet.vetContact
                    ]);
                }
            }

            // Insert past pets
            if (pastPets && pastPets.length > 0) {
                for (const pet of pastPets) {
                    const pastPetSql = `
                        INSERT INTO past_pets (
                            applicant_id, species, age, status, is_rescued, is_bred
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(pastPetSql, [
                        applicationId, pet.species, pet.age, pet.status, pet.isRescued, pet.isBred
                    ]);
                }
            }

            await connection.commit(); // Commit the transaction if all inserts are successful
            res.status(201).json({ message: 'Application created successfully!', applicationId: applicationId });

        } catch (transactionError) {
            await connection.rollback(); // Rollback if any error occurs during the transaction
            console.error("Transaction failed:", transactionError);
            res.status(500).json({ message: 'Failed to create application due to a database error.' });
        } finally {
            connection.release(); // Release the connection back to the pool
        }

    } catch (err) {
        console.error("Server error during application creation:", err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- API Route for READ (GET /api/applications/:id) ---
// Retrieves a single application by ID
app.get('/api/applications/:id', async (req, res) => {
    const { id } = req.params; // Get ID from URL parameters

    try {
        // Fetch a single application by ID
        const applicantSql = `SELECT * FROM applicants WHERE id = ?`;
        const applicant = await executeQuery(applicantSql, [id]);

        if (applicant.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        const membersSql = `SELECT * FROM household_members WHERE applicant_id = ?`;
        const members = await executeQuery(membersSql, [id]);

        const currentPetsSql = `SELECT * FROM current_pets WHERE applicant_id = ?`;
        const currentPets = await executeQuery(currentPetsSql, [id]);

        const pastPetsSql = `SELECT * FROM past_pets WHERE applicant_id = ?`;
        const pastPets = await executeQuery(pastPetsSql, [id]);

        res.status(200).json({
            applicant: applicant[0],
            members: members,
            currentPets: currentPets,
            pastPets: pastPets
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve application.', error: err.message });
    }
});

// --- API Route for READ (GET /api/applications) ---
// Retrieves all applications
app.get('/api/applications', async (req, res) => {
    try {
        // Fetch all applications (only applicant basic info for brevity, could join for more)
        const allApplicantsSql = `SELECT id, username, full_name, email_address FROM applicants`;
        const allApplicants = await executeQuery(allApplicantsSql);
        res.status(200).json(allApplicants);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve applications.', error: err.message });
    }
});

// --- API Route for UPDATE (PUT /api/applications/:id) ---
// Updates an existing application by ID
app.put('/api/applications/:id', async (req, res) => {
    const { id } = req.params;
    const { applicant, members, currentPets, pastPets } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Application ID is required for update.' });
    }
    if (!applicant) {
        return res.status(400).json({ message: 'Applicant data is required for update.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update applicant information
            const updateApplicantSql = `
                UPDATE applicants SET
                    username = ?, password = ?, full_name = ?, age = ?, nationality = ?, address = ?,
                    telephone = ?, mobile_number = ?, email_address = ?, occupation = ?,
                    residence_type = ?, ownership_type = ?, allowed_pets = ?, child_behave = ?,
                    permission_to_visit = ?
                WHERE id = ?
            `;
            const [updateResult] = await connection.execute(updateApplicantSql, [
                applicant.username, applicant.password, applicant.fullName, applicant.age,
                applicant.nationality, applicant.address, applicant.telephone,
                applicant.mobileNumber, applicant.emailAddress, applicant.occupation,
                applicant.residenceType, applicant.ownershipType, applicant.allowedPets,
                applicant.childBehave, applicant.permissionToVisit, id
            ]);

            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Application not found for update.' });
            }

            // For related data (members, pets), it's common to:
            // 1. Delete all existing related records for this applicant_id.
            // 2. Insert the new/updated related records.
            // This is simpler than comparing and updating individual child records.
            await connection.execute(`DELETE FROM household_members WHERE applicant_id = ?`, [id]);
            if (members && members.length > 0) {
                for (const member of members) {
                    const memberSql = `
                        INSERT INTO household_members (
                            applicant_id, name, relationship, age, has_allergies, supports_adoption
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(memberSql, [
                        id, member.name, member.relationship, member.age,
                        member.hasAllergies, member.supportsAdoption
                    ]);
                }
            }

            await connection.execute(`DELETE FROM current_pets WHERE applicant_id = ?`, [id]);
            if (currentPets && currentPets.length > 0) {
                for (const pet of currentPets) {
                    const currentPetSql = `
                        INSERT INTO current_pets (
                            applicant_id, species, age, gender, is_rescued, is_neutered_spayed,
                            is_bred, vet_name, vet_contact
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(currentPetSql, [
                        id, pet.species, pet.age, pet.gender, pet.isRescued,
                        pet.isNeuteredSpayed, pet.isBred, pet.vetName, pet.vetContact
                    ]);
                }
            }

            await connection.execute(`DELETE FROM past_pets WHERE applicant_id = ?`, [id]);
            if (pastPets && pastPets.length > 0) {
                for (const pet of pastPets) {
                    const pastPetSql = `
                        INSERT INTO past_pets (
                            applicant_id, species, age, status, is_rescued, is_bred
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(pastPetSql, [
                        id, pet.species, pet.age, pet.status, pet.isRescued, pet.isBred
                    ]);
                }
            }

            await connection.commit();
            res.status(200).json({ message: 'Application updated successfully!' });

        } catch (transactionError) {
            await connection.rollback();
            console.error("Transaction failed during update:", transactionError);
            res.status(500).json({ message: 'Failed to update application due to a database error.' });
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Server error during application update:", err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- API Route for DELETE (DELETE /api/applications/:id) ---
// Deletes an application and all its related records by ID
app.delete('/api/applications/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Application ID is required for deletion.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete related records first due to foreign key constraints (if any)
            await connection.execute(`DELETE FROM household_members WHERE applicant_id = ?`, [id]);
            await connection.execute(`DELETE FROM current_pets WHERE applicant_id = ?`, [id]);
            await connection.execute(`DELETE FROM past_pets WHERE applicant_id = ?`, [id]);

            // Delete the main applicant record
            const [deleteResult] = await connection.execute(`DELETE FROM applicants WHERE id = ?`, [id]);

            if (deleteResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Application not found for deletion.' });
            }

            await connection.commit();
            res.status(200).json({ message: 'Application deleted successfully!' });

        } catch (transactionError) {
            await connection.rollback();
            console.error("Transaction failed during delete:", transactionError);
            res.status(500).json({ message: 'Failed to delete application due to a database error.' });
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Server error during application deletion:", err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// 6. Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API Endpoints:');
    console.log(`   POST   /api/applications (Create new application)`);
    console.log(`   GET    /api/applications (Get all applications)`);
    console.log(`   GET    /api/applications/:id (Get application by ID)`);
    console.log(`   PUT    /api/applications/:id (Update application by ID)`);
    console.log(`   DELETE /api/applications/:id (Delete application by ID)`);
    console.log(`   POST   /api/login (User login)`); // Added for clarity
});

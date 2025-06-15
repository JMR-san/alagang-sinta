const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const supabase = require('./supabaseClient');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Sample route to fetch pets
app.get('/pets', async(req,res) => {
    const{data, error} = await supabase
    .from('pet_details')
    .select('*');

    if(error){
        return res.status(500).json({error: error.message});
    }

    res.json(data);
})

app.listen(3000,() => {
    console.log('Server running on http://localhost:3000');
});
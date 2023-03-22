const express = require('express')
const data = require('./data.json')
const app = express();
const port = 3000;

app.use(express.json())
app.use(express.static('public'))

const database = {
    contacts: data.contacts,
    newContactId: data.contacts.length + 1
}

app.get(`/api/contacts`, (req, res) => {
    res.json(database.contacts);
})

app.delete(`/api/contacts`, (req, res) => {
    const id = req.query.id;
    let count = database.contacts.length;

    database.contacts = database.contacts.filter(contact => contact.id !== id)

    const statusCode = count > database.contacts.length ? 204 : 200;

    return res.status(statusCode).send();
})


app.put(`/api/contacts`, (req, res) => {
    let contact = req.body.contact;

    if (validateContact(contact)) {
        contact = {
            photo: "default.jpg",
            ...contact,
            id: (database.newContactId).toString()
        }

        database.contacts.push(contact);
        database.newContactId += 1

        res.status(201).json(contact)
    } else {
        res.status(400).json({
            message: "contact is not valid"
        });
    }
})

app.patch(`/api/contacts`, (req, res) => {
    const contact = req.body;

    if (validateContact(contact)) {
        // contact.address = getGPSLocation(contact.company.address);

        database.contacts = database.contacts.map(currentContact => {
            return currentContact.id !== contact.id ? currentContact : {...currentContact, ...contact}
        })

        res.status(200).json({
            contact,
        })
    } else {
        res.status(400).json({
            message: "contact is not valid"
        });
    }
})

function validateContact(contact) {
    // TODO: Check data for validity and security.

    if (contact.phone && /[^\(\)+0-9\s]+/.test(contact.phone)) {
        return false;
    }
    return true
}

async function getGPSLocation(address) {
    // TODO: Fix google maps api billing and include results.
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDKvvBgAkSCugEbXckutuAFuqPzthsCnJ8`)
    const responseData = await response.json();

    return responseData;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
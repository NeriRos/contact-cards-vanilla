async function contactsApi(method, id, body) {
    const params = id ? `?id=${id}` : "";

    return fetch(`/api/contacts${params}`, {
        method: method.toUpperCase(),
        headers: {
            "Content-Type": "application/json"
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
    })
}

async function getContacts() {
    const response = await contactsApi("GET");
    return await response.json();
}

async function addContact(contact) {
    const response = await contactsApi("PUT", undefined, {contact});
    const responseData = await response.json();

    if (response.status !== 201) {
        throw new Error(responseData.message)
    }

    return responseData;
}

async function removeContact(id) {
    const response = await contactsApi("DELETE", id);
    return response.status === 204;
}

async function updateContact(id, data) {
    const response = await contactsApi("PATCH", id, data);
    const responseData = await response.json();

    if (response.status !== 200) {
        throw new Error(responseData.message)
    }

    return responseData;
}

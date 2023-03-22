class ContactList {
    constructor(contacts) {
        this.contactList = document.getElementById('contact-list');

        this.addContactButton = document.getElementById('add-contact')
        this.addContactButton.addEventListener("click", this.handleAddContactClick.bind(this))

        this.contacts = [];

        this.initContacts(contacts);

    }

    initContacts(contacts) {
        for (const contact of contacts) {
            this.addContact(contact);
        }
    }

    async handleAddContactClick(e) {
        // const contactData = await addContact({});
        this.addContact({
            photo: "default.jpg",
            name: "New Contact",
            isNew: true,
        });
    }

    async handleDeleteContactClick(contact) {
        const isSuccess = contact.isNew ? true : await removeContact(contact.id);

        if (isSuccess) {
            const listItemToRemove = document.querySelector(`li:has(> #contact-${contact.id})`);
            listItemToRemove.remove();

            this.contacts = this.contacts.filter(currentContact => currentContact.id !== contact.id);
        } else {
            alert("Can't delete contact");
        }
    }

    addContact(contactData) {
        const contact = this.createContact(contactData);
        this.contacts.push(contact);

        const listItem = document.createElement("li")
        listItem.appendChild(contact.cardElement);

        this.contactList.insertBefore(listItem, document.querySelector("#add-contact-container"))
    }

    createContact(contact) {
        return new Contact(contact, this.handleDeleteContactClick.bind(this));
    }
}

class Contact {
    constructor(contactData, onDelete) {
        this.id = contactData.id;
        this.data = contactData;
        this.isNew = contactData.isNew;
        this.editMode = false;
        this.cardElement = this.createContactElement();
        this.delete = onDelete;
    }

    handleDeleteContactClick() {
        this.delete?.(this);
    }

    handleEditContactClick(e) {
        this.toggleEditMode(this.cardElement);
    }

    async update() {
        this.toggleEditMode(this.cardElement);

        const newData = {
            id: this.id,
            role: this.cardElement.querySelector('.contact-role').innerText,
            name: this.cardElement.querySelector('.contact-name').innerText,
            address: this.cardElement.querySelector('.contact-address').innerText,
            phone: this.cardElement.querySelector('.contact-phone').innerText,
            company: {
                name: this.cardElement.querySelector('.company-name').innerText,
                address: this.cardElement.querySelector('.company-address').innerText,
            },
        }

        try {
            if (!this.isNew) {
                await updateContact(this.id, newData);
            } else {
                const contact = await addContact(newData);
                this.id = contact.id;
                this.isNew = false;
                this.cardElement.classList.remove('new');
            }
        } catch (e) {
            console.error(e);
            alert(`Can't ${this.isNew ? "create" : "update"} contact: ${e.message}`);
            if (this.isNew)
                this.handleDeleteContactClick();
            else {
                // TODO: Revert values back
            }
        }
    }

    toggleEditMode(cardElement) {
        let contentEditable;
        const editButton = cardElement.querySelector('.edit-button');
        const submitButton = cardElement.querySelector('.submit-button');

        if (this.editMode) {
            this.editMode = false;
            cardElement.classList.remove("edit");
            editButton.classList.remove("hidden");
            submitButton.classList.add("hidden");
        } else {
            this.editMode = true;
            cardElement.classList.add("edit");
            submitButton.classList.remove("hidden");
            editButton.classList.add("hidden");
        }

        cardElement.querySelector('.contact-role').setAttribute('contenteditable', this.editMode.toString());
        cardElement.querySelector('.contact-name').setAttribute('contenteditable', this.editMode.toString());
        cardElement.querySelector('.contact-address').setAttribute('contenteditable', this.editMode.toString());
        cardElement.querySelector('.company-name').setAttribute('contenteditable', this.editMode.toString());
        cardElement.querySelector('.company-address').setAttribute('contenteditable', this.editMode.toString());
        cardElement.querySelector('.contact-phone').setAttribute('contenteditable', this.editMode.toString());
    }

    createContactElement() {
        const contactCard = document.createElement('div');
        contactCard.classList.add("contact-card");
        contactCard.setAttribute('id', `contact-${this.id}`);
        contactCard.dataset.contact_id = this.id;

        // Sections
        const contactCardLeftSection = document.createElement('div');
        contactCardLeftSection.classList.add("contact-card-left");
        contactCard.appendChild(contactCardLeftSection)

        const contactCardRightSection = document.createElement('div');
        contactCardRightSection.classList.add("contact-card-right");
        contactCard.appendChild(contactCardRightSection)

        // Left Section
        const contactImage = document.createElement('img');
        contactImage.classList.add("contact-photo")
        contactImage.setAttribute('src', `/assets/${this.data.photo}`)
        contactCardLeftSection.appendChild(contactImage)

        const contactRole = document.createElement('span');
        contactRole.classList.add("contact-role")
        contactRole.innerText = this.data.role;
        contactCardLeftSection.appendChild(contactRole)

        // Right Section
        const contactName = document.createElement('span');
        contactName.classList.add("contact-name")
        contactName.innerText = this.data.name;
        contactCardRightSection.appendChild(contactName)

        const contactLocation = document.createElement('span');
        contactLocation.classList.add("contact-address")
        contactLocation.innerText = this.data.address;
        contactCardRightSection.appendChild(contactLocation)

        // Company Container
        const contactCompany = document.createElement('div');
        contactCompany.classList.add("contact-company-container")
        contactCardRightSection.appendChild(contactCompany)

        const companyName = document.createElement('span');
        companyName.classList.add("company-name")
        companyName.innerText = this.data.company?.name;
        contactCompany.appendChild(companyName)

        const companyLocation = document.createElement('span');
        companyLocation.classList.add("company-address")
        companyLocation.innerText = this.data.company?.address;
        contactCompany.appendChild(companyLocation)

        const contactPhone = document.createElement('span');
        contactPhone.classList.add("contact-phone")
        contactPhone.innerText = this.data.phone;
        contactCompany.appendChild(contactPhone)

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add("actions-container")
        contactCompany.appendChild(actionsContainer)

        const editButton = document.createElement('button');
        editButton.classList.add("edit-button")
        editButton.innerText = "✏️"
        actionsContainer.appendChild(editButton)
        editButton.addEventListener("click", this.handleEditContactClick.bind(this))

        const submitButton = document.createElement('button');
        submitButton.classList.add("submit-button", "hidden")
        submitButton.innerText = "💾"
        actionsContainer.appendChild(submitButton)
        submitButton.addEventListener("click", this.update.bind(this))

        const deleteButton = document.createElement('button');
        deleteButton.classList.add("delete-button")
        deleteButton.innerText = "🗑️"
        actionsContainer.appendChild(deleteButton);
        deleteButton.addEventListener("click", this.handleDeleteContactClick.bind(this))

        if (this.isNew) {
            const tempId = `temp-${Math.random()}`.replace('.', "");
            this.id = tempId;
            contactCard.setAttribute('id', `contact-${this.id}`);
            contactCard.dataset.contact_id = this.id;

            this.toggleEditMode(contactCard)
        }

        return contactCard;
    }
}

(async () => {
    const contacts = await getContacts();
    const contactList = new ContactList(contacts);
})();
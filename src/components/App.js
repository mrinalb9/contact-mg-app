import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import AddContact from './AddContact';
import ContactList from './ContactList';
import EditContact from './EditContact';
import {v4 as uuid} from 'uuid';
import ContactDetail from './ContactDetail';
import api from "../api/contacts";

function App() { 
  const LOCAL_STORAGE_KEY = "contacts"; 
  const [contacts, setContacts] = useState(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
//RetrieveContacts
  const retrieveContacts = async () => {
    const response = await api.get("/contacts");
    return response.data;
  }

  const addContactHandler = async (contact) => {
    console.log(contact);
    const request = {
      id: uuid(),
      ...contact,
    };

    const response = await api.post("/contacts", request)
    console.log(response);
    setContacts([...contacts, response.data]);
  };

  const updateContactHandler = async (contact) => {
    const response = await api.put(`/contacts/${contact.id}`, contact)
    const {id, name, email} = response.data;
    setContacts(
      contacts.map((contact) => {
      return contact.id === id ? {...response.data} : contact
    })
    );
  };

  const removeContactHandler = async (id) => {
    await api.delete(`/contacts/${id}`);
    const newContactList = contacts.filter((contact) => {
      return contact.id !== id;
    });
  
    setContacts(newContactList);
  };

  const searchHandler = (searchTerm) => {
    setSearchTerm(searchTerm);
    if(searchTerm !== "") {
      const newContactList = contacts.filter((contact) => {
      return  Object.values(contact)
        .join(" ").toLowerCase()
        .includes(searchTerm.toLowerCase());
      });
      setSearchResults(newContactList);
    }
    else {
      setSearchResults(contacts);
    }
  };
 
  useEffect(() => {
  // const retriveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));  // gets data back from the local storage
  // if (retriveContacts) setContacts(retriveContacts);
  const getAllContacts = async () => {
    const allContacts = await retrieveContacts();
    if(allContacts) setContacts(allContacts);
  };

  getAllContacts();
}, []); 

  useEffect(() => {
    //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
  },[contacts]);

  return (
    <div className="ui container">
           <Router>
            <Header/>
            <Switch>
              <Route 
                path="/" 
                exact 
                render = {(props) => (
                  <ContactList 
                    {...props } 
                    contacts={searchTerm.length < 1 ? contacts : searchResults} 
                    getContactId={removeContactHandler}
                    term = {searchTerm}
                    searchKeyword = {searchHandler}
                  />
                )}
                /* not using component= { () => ( <ContactList contacts={contacts} getContactId={removeContactHandler}/> )} because it will react.create again and execute func again n again */
              />
              <Route 
                path="/add" 
                render = {(props) => (
                  <AddContact 
                    {...props } 
                    // contacts={contacts}     //not in tutorial
                    addContactHandler={addContactHandler}
                  />
                )}
              />

              <Route 
                path="/edit" 
                render = {(props) => (
                  <EditContact 
                    {...props } 
                    // contacts={contacts}    
                    updateContactHandler={updateContactHandler}
                  />
                )}
              />  
              
              <Route path="/contact/:id" component={ContactDetail} />
            </Switch>

            {/* <AddContact addContactHandler={addContactHandler} />
            <ContactList contacts={contacts} getContactId={removeContactHandler} /> */}
            
           </Router>
           
            
    </div>
   );  
}

export default App;

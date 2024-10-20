// src/popup.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUp,
  ArrowDown,
  Delete,
  Edit
} from './svg_element';

/**
 * @param { { display_name: string, url: string } } props
 * @returns {JSX.Element}
 * */
function ListElement({ display_name, url, list, setList }) {
  return (
    <li className="ListRoot" key={url}>
      <div>
        <a href={url}> {display_name} </a>
        <div>
          <button onClick={() => {
            // get the index of the element in the list
            let index = list.findIndex((list) => list.url === url);

            // if the index is not the first element
            if (index > 0) {
              // swap the current element with the previous element
              let temp = list[index];
              list[index] = list[index - 1];
              list[index - 1] = temp;
              setList([...list]);
            }
          }}> <ArrowUp /> </button>

          <button onClick={() => {
            // get the index of the element in the list
            let index = list.findIndex((list) => list.url === url);

            // if the index is not the last element
            if (index < list.length - 1) {
              // swap the current element with the next element
              let temp = list[index];
              list[index] = list[index + 1];
              list[index + 1] = temp;
              setList([...list]);
            }
          }}> <ArrowDown /> </button>

          <button onClick={() => {
            let newName = prompt("Enter the new name for the list");
            if (newName) {
              let index = list.findIndex((list) => list.url === url);
              list[index].display_name = newName;
              setList([...list]);
            }
            else {
              alert("Invalid name, no changes made");
            }
          }}> <Edit /> </button>

          <button onClick={() => {
            setList(list.filter((list) => list.url !== url));
          }}> <Delete /> </button>
        </div>
      </div>
    </li>
  );
}

/**
 * @param { { 
 * list: {display_name: string, url: string}[],
 * setList: (newList: {display_name: string, url: string}[]) => void } } props
 * @returns {JSX.Element}
*/
function ListDisplay({ list: list, setList: setList }) {
  return <>
    <ul>
      {list.map((listId) => (
        <ListElement
          display_name={listId.display_name}
          url={listId.url}
          list={list}
          setList={setList} />
      ))}
    </ul>

    {/* Add and remove buttons */}
    <div className="listBtnContainer">
      <button className="listBtn" onClick={() => {
        let newList = prompt("Enter the name of the new list");
        let newUrl = prompt("Enter the url of the new list");
        if (newList && newUrl) {
          setList([...list, { display_name: newList, url: newUrl }]);
        }
        else {
          alert("Invalid name or url, no changes name");
        }
      }}> Add List </button>

      <button className="listBtn" onClick={() => {
        let newList = prompt("Enter the name of the list to delete");
        if (newList) {
          setList(list.filter((list) => list.display_name !== newList));
        }
        else {
          alert("Invalid list name, no changes made");
        }
      }}> Delete List </button>

    </div>
  </>;
}

function Popup() {
  /**
   * @type { [ {display_name: string, url: string}[],
   *           (list: {display_name: string, url: string}[]) => void ] }
   */
  const [list, setList] = React.useState([]);
  const [url, setUrl] = React.useState("List Manager");

  /** Get the list for the current url from the (firefox) browser storage */
  React.useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: "getURL" })
        .then((response) => {
          if (response.url) {
            let domain = new URL(response.url).hostname;
            setUrl(domain);
            browser.storage.local.get(domain).then((result) => {
              if (result && Object.keys(result[domain]).length > 0) {
                setList(result[domain]);
              } else {
                setList([]);
              }
            })
          } else {
            setUrl("No URL found");
            setList([]);
          }
        })
        .catch((error) => {
          console.error("Error getting url", error);
        });
    });
  }, []);

  /** When the list get updated save the list in storage with the domain */
  React.useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (url !== "List Manager") {
        browser.storage.local.set({ [url]: list });
      }
    })
  }, [list]);
  return (
    <div className="appRoot">
      <h4> {url} </h4>
      <ul>
        <ListDisplay list={list} setList={setList} />
      </ul>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Popup />);

// src/popup.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUp,
  ArrowDown,
  Delete,
  Edit,
  Burger,
  Check
} from './svg_element';

/**
 * @param { { display_name: string, url: string } } props
 * @returns {JSX.Element}
 * */
function ListElement(
{
  display_name,
  url,
  setList,
  list,
  setKeyboardControlledId,
  keyboardControlledId,
  checked
}) {

  const [ElementID, setId] = React.useState(null);

  /** The idex of the element is used as the id here */
  React.useEffect(() => { setId(list.findIndex((list) => list.url === url)) }, [list]);
  let className =  checked ? 'checked' : '';
  className += (ElementID === keyboardControlledId) ? ' highlighted' : '';
  return (
    <li className="ListRoot" key={url}>
      <div className={className}>
        <a href={url}> {display_name} </a>
        <div>
          <button onClick={() => {
            list[ElementID].checked = !checked;
            setList([...list]);
          }}> <Check checked={checked} /> </button>

          <button onClick={() => {
            if (keyboardControlledId === ElementID) {
              setKeyboardControlledId(null);
            }
            else {
              setKeyboardControlledId(ElementID);
            }
          }}> <Burger /> </button>

          <button onClick={() => {
            // if the index is not the first element
            if (ElementID > 0) {
              // swap the current element with the previous element
              let temp = list[ElementID];
              list[ElementID] = list[ElementID - 1];
              list[ElementID - 1] = temp;
              setList([...list]);
            }
          }}> <ArrowUp /> </button>

          <button onClick={() => {
            // if the index is not the last element
            if (ElementID < list.length - 1) {
              // swap the current element with the next element
              let temp = list[ElementID];
              list[ElementID] = list[ElementID + 1];
              list[ElementID + 1] = temp;
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

function jsonListimport(jsonImportData, setList) {
  // check if the json is a list of pairs of strings
  if (jsonImportData && jsonImportData.length > 0) {
    let valid = jsonImportData.every((item) => {
      return item.display_name && item.url;
    });

    if (valid) {
      setList([...jsonImportData]);
    } else {
      alert("Invalid JSON, no changes made");
    }
  } else {
    alert("Invalid JSON, no changes made");
  }
}

/**
 * @returns {JSX.Element}
 * @description Sometimes websites change domain names so this form will allow 
 * the user to input a domain name and copy the json list to the clipboard.
 */
function OldListExporter() {
  // horizontal form to input a domain name and a button to copy the list to the
  // clipboard
  return (
    <div className="oldListExporter">
      <div>Export an old Domain:</div>
      <input type="text" id="domainInput" placeholder="Enter domain name" />
      <button onClick={() => {
        const domain = document.getElementById("domainInput").value;
        if (domain) {
          browser.storage.local.get(domain).then((result) => {
            if (result && result[domain]) {
              const jsonExport = JSON.stringify(result[domain]);
              navigator.clipboard.writeText(jsonExport).then(() => {
                alert("List copied to clipboard");
              });
            } else {
              alert("No list found for this domain");
            }
          });
        } else {
          alert("Please enter a valid domain name");
        }
      }
      }> Export List </button>
    </div>
  );
}

/**
 * @param { { 
 * list: {display_name: string, url: string}[],
 * setList: (newList: {display_name: string, url: string}[]) => void
 * setKeyboardControlledId: (id: number | null) => void
 * keyboardControlledId: number | null
 * } } props,
 * @returns {JSX.Element}
*/
function ListDisplay({ 
  list: list, 
  setList: setList, 
  setKeyboardControlledId: setKeyboardControlledId,
  keyboardControlledId }) {
  return <>
    <ul>
      {list.map((listItem) => (
        <ListElement
        key={listItem.url}
          display_name={listItem.display_name}
          url={listItem.url}
          list={list}
          setList={setList}
          setKeyboardControlledId={setKeyboardControlledId}
          keyboardControlledId={keyboardControlledId}
          checked={listItem.checked || false}
          />
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

        <button className="listBtn" onClick={() => {
          let jsonImport_s = prompt("Enter the JSON sting to import");
          if (jsonImport_s) {
            try {
              let jsonImport = JSON.parse(jsonImport_s);
              jsonListimport(jsonImport, setList);
            } catch (error) {
              console.error("Error parsing JSON", error);
            }
          }
          else {
            alert("Invalid list name, no changes made");
          }
        }}> Import List </button>

      <button className="listBtn" onClick={() => {
        let jsonExport = JSON.stringify(list);
        navigator.clipboard.writeText(jsonExport).then(() => {
          alert("List copied to clipboard");
        });
      }}> Export List </button>
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
  const [keyboardControlledId, setKeyboardControlledId] = React.useState(null);


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

        }).catch((error) => {
          console.error("Error getting url", error);
        });
    });
  }, []);

  /** Keyboard shift controls, react make a new func ref everytime one of the 
   * deps changes */
  const handleKeyDown = React.useCallback((event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    let delta = event.key === "ArrowUp" ? -1 : 1;
  
    if (delta === -1 && keyboardControlledId <= 0) return;
    if (delta === 1 && keyboardControlledId >= list.length - 1) return;
  
    const temp = list[keyboardControlledId];
    list[keyboardControlledId] = list[keyboardControlledId + delta];
    list[keyboardControlledId + delta] = temp;
    setList([...list]);
    setKeyboardControlledId(keyboardControlledId + delta);
  }, [keyboardControlledId, list, setList]);
  
  // adding and removing the event listener for the arrow keys
  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // magic cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  

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
        <OldListExporter />
        <ListDisplay
        list={list}
        setList={setList}
        setKeyboardControlledId={setKeyboardControlledId}
        keyboardControlledId={keyboardControlledId}/>
      </ul>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Popup />);
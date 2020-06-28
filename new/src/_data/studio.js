const fetch = require('node-fetch');

module.exports = async() => {
  try {
    const response = await fetch(
      'https://11ty-from-scratch-content-feeds.piccalil.li/media.json'
    );
    const {items} = await response.json();

    return items;
  } catch(e) { 
    console.log(e);
    return [];
  }
}
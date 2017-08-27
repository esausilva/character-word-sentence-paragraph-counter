import React, { Component } from 'react';
import { render } from 'react-dom';
import { compose } from 'ramda';
import 'whatwg-fetch';
import './style.css';

class App extends Component {
  state = {
    text: '',
    charCount: 0,
    wordCount: 0,
    sentenceCount: 0,
    paragraphCount: 0
  }

  componentDidMount() {
    this.getBacon()
      .then(bacon => {
        this.setState({ text: bacon.join('\n\n') }, () => this.setCounts(this.state.text));
      })
      .catch(err => this.setState({ text: `Error: ${err.message}` }));
  }

  /*
    Fetches three parapgraphs from https://baconipsum.com/
  */
  getBacon = async () => {
    const response = await fetch('https://baconipsum.com/api/?type=all-meat&paras=3');
    const body = await response.json();
    
    if (response.status !== 200) 
      throw Error(body.message);

    return body;
  }

  /*
    When pressing Enter key individual elements in the array will come
    with the 'break' character and producing an incorrect word count. This function
    removes those breaks and splits them.
    i.e. ["↵↵Turkey","pork","cow","tri-tip","↵↵Bresaola↵↵brisket","pork"]
  */
  // removeBreaks = arr => (
  //   arr.reduce((acc, item) => {
  //     item.includes('\n') ? acc.push(...item.split('\n')) : acc.push(item)
  //     return acc;
  //   }, [])
  // );
  removeBreaks = arr => {
    const index = arr.findIndex(el => el.match(/\r?\n|\r/g));
    
    if (index === -1) 
      return arr;
    
    const newArray = [
      ...arr.slice(0,index),
      ...arr[index].split(/\r?\n|\r/),
      ...arr.slice(index+1, arr.length)
    ];

    return this.removeBreaks(newArray);
  }

  /*
    When entering multiple spaces or breaks (Enter key), the array will come
    with empty elements. This function removes those elements. 
    i.e. ["turkey.", "", "Bacon"]
  */
  removeEmptyElements = arr => {
    const index = arr.findIndex(el => el.trim() === '');

    if (index === -1) 
      return arr;

    arr.splice(index, 1);

    return this.removeEmptyElements(arr)
  };

  setCounts = value => {
    const trimmedValue = value.trim();
    const words = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split(' '));
    const sentences = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split('.'));
    const paragraphs = this.removeEmptyElements(trimmedValue.split(/\r?\n|\r/));

    this.setState({
      text: value,
      charCount: trimmedValue.length,
      wordCount: value === '' ? 0 : words.length,
      sentenceCount: value === '' ? 0 : sentences.length,
      paragraphCount: value === '' ? 0 : paragraphs.length
    });
  }

  handleChange = e => this.setCounts(e.target.value);

  render() {
    return (
      <div>
        <textarea rows='15' onChange={this.handleChange} value={this.state.text}></textarea>
        <p><strong>Character Count:</strong> {this.state.charCount}<br/>
        <strong>Word Count:</strong> {this.state.wordCount}<br/>
        <strong>Sentence Count:</strong> {this.state.sentenceCount}<br/>
        <strong>Paragraph Count:</strong> {this.state.paragraphCount}</p>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));

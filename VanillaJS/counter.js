/*
  Some initial set up
*/

// BlingJS: based on https://gist.github.com/paulirish/12fb951a8b893a454b32
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function(name, fn) {
  this.addEventListener(name, fn);
};
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function(
  name,
  fn
) {
  this.forEach(elem => {
    elem.on(name, fn);
  });
};

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/*
  Fetches three parapgraphs from https://baconipsum.com/
*/
getBacon = async () => {
  const response = await fetch(
    'https://baconipsum.com/api/?type=all-meat&paras=3'
  );
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};

/*
  When pressing Enter key individual elements in the array will come
  with the 'break' character and producing an incorrect word count. This function
  removes those breaks and splits them.
  i.e. ["↵↵Turkey","pork","cow","tri-tip","↵↵Bresaola↵↵brisket","pork"]
*/
removeBreaks = arr => {
  const index = arr.findIndex(el => el.match(/\r?\n|\r/g));

  if (index === -1) return arr;

  const newArray = [
    ...arr.slice(0, index),
    ...arr[index].split(/\r?\n|\r/),
    ...arr.slice(index + 1, arr.length)
  ];

  return removeBreaks(newArray);
};

/*
  When entering multiple spaces or breaks (Enter key), the array will come
  with empty elements. This function removes those elements. 
  i.e. ["turkey.", "", "Bacon"]
*/
removeEmptyElements = arr => {
  const index = arr.findIndex(el => el.trim() === '');

  if (index === -1) return arr;

  arr.splice(index, 1);

  return removeEmptyElements(arr);
};

const textarea = $('#text');
const charactersSpan = $('#characters');
const wordsSpan = $('#words');
const sentencesSpan = $('#sentences');
const paragraphsSpan = $('#paragraphs');

setCounts = value => {
  const trimmedValue = value.trim();
  const words = R.compose(removeEmptyElements, removeBreaks)(
    trimmedValue.split(' ')
  );
  const sentences = R.compose(removeEmptyElements, removeBreaks)(
    trimmedValue.split('.')
  );
  const paragraphs = removeEmptyElements(trimmedValue.split(/\r?\n|\r/));

  charactersSpan.innerText = trimmedValue.length;
  wordsSpan.innerText = value === '' ? 0 : words.length;
  sentencesSpan.innerText = value === '' ? 0 : sentences.length;
  paragraphsSpan.innerText = value === '' ? 0 : paragraphs.length;
};

/*
  Listening to 'keyup' event and updating counts every 130ms
*/
textarea.on('keyup', debounce(e => setCounts(e.target.value), 130));

/*
  On windoww load, load initial text
*/
window.on('load', () => {
  getBacon()
    .then(bacon => {
      const text = bacon.join('\n\n');
      textarea.innerText = text;
      setCounts(text);
    })
    .catch(err => (textarea.innerText = `Error: ${err.message}`));
});

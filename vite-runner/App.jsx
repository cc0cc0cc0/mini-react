import React from './corejs/React.js';
// const App=React.createElement("div",{id:'app'},'hi-','mini','react');
function Counter({num}){
    return <div>counter:{num}</div>
}

const App = (
    <div>
        hi-mini-react
        <Counter num={10}></Counter>
        <Counter num={20}></Counter>
    </div>
)
console.log(App);
export default App;
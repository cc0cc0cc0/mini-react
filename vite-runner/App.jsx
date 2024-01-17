import React from './corejs/React.js';
// const App=React.createElement("div",{id:'app'},'hi-','mini','react');
let count;
let props = {id:'111'}
function Counter({ num }) {
    count=num
    function handleClick() {
        console.log('click');
        count++
        props = {}
        React.update()
    }
    return <div {...props}>counter:{count}<button onClick={handleClick}>Click</button></div>
}

const App = (
    <div>
        hi-mini-react
        <Counter num={10}></Counter>
        {/* <Counter num={20}></Counter>
        <Counter num={30}></Counter> */}
    </div>
)
console.log(App);
export default App;
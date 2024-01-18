import React from './corejs/React.js';
// const App=React.createElement("div",{id:'app'},'hi-','mini','react');
let showBar = false;
let props = { id: '111' }
function Counter({ num }) {
    const foo = <div>foo<div>child1</div><div>child2</div></div>
    const bar = (<div>bar</div>)
    function handleClick() {
        showBar = !showBar;
        React.update()
    }
    return (<div {...props}>
        counter
        {showBar && bar}
        <button onClick={handleClick}>Click</button>
        </div>)
}

const App = (
    <div>
        hi-mini-react
        <Counter></Counter>
        {/* <Counter num={20}></Counter>
        <Counter num={30}></Counter> */}
    </div>
)
console.log(App);
export default App;
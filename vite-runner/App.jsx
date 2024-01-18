import React from './corejs/React.js';
// const App=React.createElement("div",{id:'app'},'hi-','mini','react');
let countFoo = 0;
let countBar = 0;
let countApp = 0;
function Foo(){
    console.log("Foo rerun")
    const update = React.update();
    function handleClick(){
        countFoo++;
        update()
    }
    return (
        <div>
            foo:{countFoo}
            <button onClick={handleClick}>click</button>
        </div>
    )
}
function Bar(){
    console.log("Bar rerun")
    const update = React.update();
    function handleClick(){
        countBar++;
        update()
    }
    return (
        <div>
            Bar:{countBar}
            <button onClick={handleClick}>click</button>
        </div>
    )
}
function App(){
    console.log("App rerun")
    const update = React.update();
    function handleClick(){
        countApp++;
        update();
    }
    return (
        <div>
            hi-mini-react: {countApp}
            <button onClick={handleClick}>click</button>
            <Foo></Foo>
            <Bar></Bar>
        </div>
    )
}
console.log(App);
export default App;
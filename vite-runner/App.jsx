import React from './corejs/React.js';
// const App=React.createElement("div",{id:'app'},'hi-','mini','react');
let isShow = false;
function Foo() {
    console.log("Foo rerun")
    const [countFoo, setCountFoo] = React.useState(0);
    const [bar, setBar] = React.useState("bar");
    const barr = <div>justshow</div>
    function handleClick() {
        setCountFoo((c) => c + 1);
        // setBar("barabc")
        // isShow = !isShow;
    }
    React.useEffect(() => {
        console.log("init")
        return () => {
            console.log("cleanup init")
        }
    }, [])
    React.useEffect(() => {
        console.log("update", countFoo)
        return () => {
            console.log("cleanup update")
        }
    }, [countFoo])
    return (
        <div>
            {isShow && barr}
            foo:{countFoo}
            <div>{bar}</div>
            <button onClick={handleClick}>click</button>
        </div>
    )
}
function Bar() {
    console.log("Bar rerun")
    const update = React.update();
    function handleClick() {
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
function App() {
    return (
        <div>
            hi-mini-react
            <Foo></Foo>
        </div>
    )
}
console.log(App);
export default App;
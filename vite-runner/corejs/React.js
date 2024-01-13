//console.log('main.js');

//v01


//v02 将上面的代码封装成二个函数
//React->vdom->js obj->dom
// type props children
// const testEl ={
//         type:'TEXT_ELEMENT',
//         props:{
//             nodeValue:'App',
//             children:[]
//         }
// }
// const el={
//     type:'div',
//     props:{
//         id:'App',
//         children:[testEl]
//     }
// }

//创建vdom
function createElement(type,props,...children){
    return {
        type,
        props:{
            ...props,
            children:children.map(child=> typeof child === 'string' ? createTextElement(child) : child)
        }
    }
}
function createTextElement(text){
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue:text,
            children:[]
        }
    }
}

// const dom = document.createElement(App.type);
// dom.id = App.props.id;
// document.querySelector('#root').appendChild(dom);

// const textNode = document.createTextNode("");
// textNode.nodeValue = textEl.props.nodeValue;
// dom.appendChild(textNode);

//真实渲染dom

function render(el,container){
    const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type);
    Object.keys(el.props).forEach(key=>{
        if(key !== 'children'){
            dom[key] = el.props[key];
        }
    })
    el.props.children.forEach(child=>render(child,dom));
    container.appendChild(dom);
    
}

const React ={
    createElement,
    render
}

export default React;
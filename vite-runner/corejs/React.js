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
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'string' ? createTextElement(child) : child)
        }
    }
}
function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
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
let nextWorkOfUnit = null;
function render(el, container) {
    nextWorkOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
    // const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type);
    // Object.keys(el.props).forEach(key => {
    //     if (key !== 'children') {
    //         dom[key] = el.props[key];
    //     }
    // })
    // el.props.children.forEach(child => render(child, dom));
    // container.appendChild(dom);

}
function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type);
}

function updateProps(dom,props) {
    Object.keys(props).forEach(key => {
        if (key !== 'children') {
            dom[key] = props[key];
        }
    })
    
}
//为什么performanceWork入参里不加一个container呢。对标render
function performanceWork(fiber) {
    if (!fiber.dom) {
        //1.渲染dom
        const dom = (fiber.dom) = createDom(fiber.type);
        //2.处理props
        updateProps(dom,fiber.props);
        fiber.parent.dom.append(dom);
    }

    //3.转换链表
    let children = fiber.props.children;
    let preChild = null
    children.forEach((child, index) => {
        //TODO 这个newFiber的child和sibling都没设置呢。后面怎么用的呢？
        let newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null
        }
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            preChild.sibling = newFiber;
        }
        preChild = newFiber;
    });
    //4.返回下次需要渲染的任务
    if (fiber.child) {
        return fiber.child
    }
    if (fiber.sibling) {
        return fiber.sibling
    }
    return fiber.parent.sibling;
}
function workLoop(IdleDeadline) {
    let shouldYield = false;
    while (!shouldYield && nextWorkOfUnit) {
        //do some work
        nextWorkOfUnit = performanceWork(nextWorkOfUnit);
        shouldYield = IdleDeadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop);

const React = {
    createElement,
    render
}

export default React;
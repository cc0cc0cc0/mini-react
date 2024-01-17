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
            children: children.map(
                child => {
                    const isTextNode = typeof child === 'string' || typeof child === 'number'
                     return isTextNode ? createTextElement(child) : child
                })
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
    root = nextWorkOfUnit;
}
function createDom(type) {
    //TODO 这里怎么开箱 把函数转成DOM 原来开箱就是调用函数，返回对象
    return type === 'TEXT_ELEMENT'
        ? document.createTextNode("")
        : document.createElement(type);
}

function updateProps(dom, nextProps,preProps) {
    //1. old有 new 没有  删除
    Object.keys(preProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)){
                dom.removeAttribute(key);
            }
            // if(key.startsWith("on")){
            //     const eventType = key.slice(2).toLowerCase();
            //     dom.addEventListener(eventType,nextProps[key])
            // } else{
            //     dom[key] = nextProps[key];
            // }
            
        }
    })
    //2. new 有 old没有 或者 不一样  更新
    Object.keys(nextProps).forEach(key => {
        if (key !== 'children') {
            if(nextProps[key] !== preProps[key]){
                if(key.startsWith("on")){
                    const eventType = key.slice(2).toLowerCase();
                    dom.removeEventListener(eventType,preProps[key])
                    dom.addEventListener(eventType,nextProps[key])
                } else{
                    dom[key] = nextProps[key];
                }
            }
        }
    })

}

function initChildrenList(fiber, children) {
    // let children = fiber.props.children
    let oldFiber = fiber.alternate?.child;
    let preChild = null
    children.forEach((child, index) => {
        //TODO 这个newFiber的child和sibling都没设置呢。后面怎么用的呢？答案是使用了链表，后续有赋值
        let isSameType = oldFiber && oldFiber.type === child.type;
        let newFiber;
        if(isSameType){
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.com,
                effctTag:'update',
                alternate:oldFiber
            }
        }else{
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: null,
                effctTag:'placement'
            }
        }
        if(oldFiber){
            oldFiber = oldFiber.sibling;
        }
       
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            preChild.sibling = newFiber;
        }
        preChild = newFiber;
    });
}
let nextWorkOfUnit = null;
let root = null;
let currentRoot = null
function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)];
    initChildrenList(fiber, children);
}
function updateHostComponent(fiber) {
    if (!fiber.dom) {
        //1.渲染dom
        const dom = (fiber.dom) = createDom(fiber.type);
        //2.处理props
        updateProps(dom, fiber.props,{});
        //fiber.parent.dom.append(dom);
    }
    const children = fiber.props.children;
    initChildrenList(fiber, children);
}
function performanceWork(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }
    // if (!isFunctionComponent) {
    //     if (!fiber.dom) {
    //         //1.渲染dom
    //         const dom = (fiber.dom) = createDom(fiber.type);
    //         //2.处理props
    //         updateProps(dom, fiber.props);
    //         //fiber.parent.dom.append(dom);
    //     }
    // }

    // const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
    // //3.转换链表
    // initChildrenList(fiber, children);
    //4.返回下次需要渲染的任务
    if (fiber.child) {
        return fiber.child
    }
    // if (fiber.sibling) {
    //     return fiber.sibling
    // }
    //最后一个节点counter:10，因为10的parent的sibling是空，应该继续找上级，但是找到何时结束呢？答案一直找到根节点(ROOT节点的parent是undefind)
    let nextFiber = fiber;
    while(nextFiber){
        if(nextFiber.sibling){
          return   nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
   // return fiber.parent.sibling;
}
function workLoop(IdleDeadline) {
    let shouldYield = false;
    while (!shouldYield && nextWorkOfUnit) {
        //do some work
        nextWorkOfUnit = performanceWork(nextWorkOfUnit);
        shouldYield = IdleDeadline.timeRemaining() < 1;
    }
    if (!nextWorkOfUnit && root) {
        commitRoot(root.child);
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop);

function commitRoot(fiber) {
    commitWork(fiber);
    currentRoot = root;
    root = null;
}
function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if (fiber.effctTag === "update"){
        updateProps(fiber.dom,fiber.props,fiber.alternate?.props);
    } else if (fiber.effctTag === "placement" ){
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom);
        }
    }


    commitWork(fiber.child);
    commitWork(fiber.sibling);

}
//更新节点和属性
function update() {
    nextWorkOfUnit = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate:currentRoot
    }
    root = nextWorkOfUnit;
}
const React = {
    createElement,
    render,
    update
}

export default React;
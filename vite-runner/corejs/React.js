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
    wipRoot = {
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
    nextWorkOfUnit = wipRoot;
}
function createDom(type) {
    //TODO 这里怎么开箱 把函数转成DOM 原来开箱就是调用函数，返回对象
    return type === 'TEXT_ELEMENT'
        ? document.createTextNode("")
        : document.createElement(type);
}

function updateProps(dom, nextProps, preProps) {
    //1. old有 new 没有  删除
    Object.keys(preProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
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
            if (nextProps[key] !== preProps[key]) {
                if (key.startsWith("on")) {
                    const eventType = key.slice(2).toLowerCase();
                    dom.removeEventListener(eventType, preProps[key])
                    dom.addEventListener(eventType, nextProps[key])
                } else {
                    dom[key] = nextProps[key];
                }
            }
        }
    })

}

function reconcileChildren(fiber, children) {
    // let children = fiber.props.children
    let oldFiber = fiber.alternate?.child;
    let preChild = null
    let hasChild = false
    children.forEach((child, index) => {
        //TODO 这个newFiber的child和sibling都没设置呢。后面怎么用的呢？答案是使用了链表，后续有赋值
        let isSameType = oldFiber && oldFiber.type === child.type;
        let newFiber;
        if (isSameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.dom,
                effectTag: 'update',
                alternate: oldFiber
            }
        } else {
            if (child) {
                newFiber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber,
                    sibling: null,
                    dom: null,
                    effectTag: 'placement'
                }
            }
            if (oldFiber) {
                deletions.push(oldFiber);
            }


        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            fiber.child = newFiber;
        } else {
            if (preChild !== null) {
                preChild.sibling = newFiber;
            } else {
                fiber.child = newFiber;
            }

        }
        if (newFiber) {
            preChild = newFiber;
        }

    });
    while (oldFiber) {
        deletions.push(oldFiber)
        oldFiber = oldFiber.sibling
    }
}
let nextWorkOfUnit = null;
//work in process
let wipRoot = null;
let currentRoot = null
let deletions = []  //待删除节点
let wipFiber = null;
function updateFunctionComponent(fiber) {
    stateHooks = [];
    effectHooks = [];
    stateHookIndex = 0;
    wipFiber = fiber;
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
    if (!fiber.dom) {
        //1.渲染dom
        const dom = (fiber.dom) = createDom(fiber.type);
        //2.处理props
        updateProps(dom, fiber.props, {});
        //fiber.parent.dom.append(dom);
    }
    const children = fiber.props.children;
    reconcileChildren(fiber, children);
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
    // reconcileChildren(fiber, children);
    //4.返回下次需要渲染的任务
    if (fiber.child) {
        return fiber.child
    }
    // if (fiber.sibling) {
    //     return fiber.sibling
    // }
    //最后一个节点counter:10，因为10的parent的sibling是空，应该继续找上级，但是找到何时结束呢？答案一直找到根节点(ROOT节点的parent是undefind)
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
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
        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = undefined
        }
        shouldYield = IdleDeadline.timeRemaining() < 1;
    }
    if (!nextWorkOfUnit && wipRoot) {
        commitRoot(wipRoot.child);
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop);

function commitRoot(fiber) {
    deletions.forEach(commitDeletion)
    commitWork(fiber);
    currentRoot = wipRoot;
    commitEffectHook();
    wipRoot = null;
    deletions = []
}

function commitEffectHook() {
    function run(fiber) {
        if (!fiber) return;
        //如果节点有effectHook,则执行,没有就继续往下
        if (!fiber.alternate) {
            //init
            fiber.effectHooks?.forEach((hook) => {
                hook.cleanup = hook.callback();
            })

        } else {
            //update 通过some看依赖数组是否有更新的
            fiber.effectHooks?.forEach((newHook, i) => {
                const oldEffectHook = fiber.alternate.effectHooks[i];
                const needUpdate = oldEffectHook?.deps.some(function (oldDeps, index) {
                    return oldDeps !== newHook.deps[index];
                })
                needUpdate && (newHook.cleanup = newHook.callback());
            })

        }

        run(fiber.child);
        run(fiber.sibling)
    }
    function runCleanup(fiber) {
        if (!fiber) return;
        //这里是一个重点,需要的是老的节点的alternate的
        fiber.alternate?.effectHooks?.forEach(hook => {
            if (hook.deps.length > 0) {
                hook.cleanup && hook.cleanup();
            }

        })
        runCleanup(fiber.child);
        runCleanup(fiber.sibling);
    }
    runCleanup(wipRoot)
    run(wipRoot)
}

function commitDeletion(fiber) {
    if (fiber.dom) {
        let fiberParent = fiber.parent
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent
        }
        fiberParent.dom.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child)
    }
}
function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if (fiber.effectTag === "update") {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.effectTag === "placement") {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom);
        }
    }


    commitWork(fiber.child);
    commitWork(fiber.sibling);

}
//更新节点和属性
function update() {
    let currentFiber = wipFiber;
    return () => {
        console.log(currentFiber);
        wipRoot = {
            //  dom: currentFiber.dom,
            //  props: currentFiber.props,
            ...currentFiber,
            alternate: currentFiber
        }
        nextWorkOfUnit = wipRoot;
    }

}
let stateHooks;
let stateHookIndex;
let stateHookQueue = [];
function useState(initial) {
    let currentFiber = wipFiber;
    let oldHook = wipFiber.alternate?.stateHooks[stateHookIndex];
    // 如果有oldHook应该使用oldHook
    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : []
    }
    stateHookIndex++;
    stateHooks.push(stateHook);
    currentFiber.stateHooks = stateHooks;
    //这里如何获取各自的action呢？ 原来是把队列加载stateHook中，就不用对应的state了。
    stateHook.queue.forEach(action => {
        stateHook.state = action(stateHook.state);
    })
    stateHook.queue = []
    function setState(action) {
        let preFetchState = typeof action === 'function' ? action(stateHook.state) : action
        if (preFetchState === stateHook.state) return;
        stateHook.queue.push(typeof action === 'function' ? action : () => action);

        console.log('stateHook.state', stateHook.state)
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }
        nextWorkOfUnit = wipRoot;
    }




    return [stateHook.state, setState]
}
let effectHooks;
function useEffect(callback, deps) {
    const effectHook = {
        callback,
        deps,
        cleanup: undefined
    }
    effectHooks.push(effectHook);
    wipFiber.effectHooks = effectHooks
}
const React = {
    createElement,
    render,
    update,
    useState,
    useEffect
}
export const VERSION = "DAY7";
export default React;

"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[560],{89705:function(e,t,n){n.d(t,{Z:function(){return c}});var r=n(1413),o=n(67294),i={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"}}]},name:"ellipsis",theme:"outlined"},a=n(42135),l=function(e,t){return o.createElement(a.Z,(0,r.Z)((0,r.Z)({},e),{},{ref:t,icon:i}))};l.displayName="EllipsisOutlined";var c=o.forwardRef(l)},57838:function(e,t,n){n.d(t,{Z:function(){return i}});var r=n(97685),o=n(67294);function i(){var e=o.useReducer((function(e){return e+1}),0);return(0,r.Z)(e,2)[1]}},86871:function(e,t,n){n.d(t,{C:function(){return K}});var r=n(87462),o=n(4942),i=n(71002),a=n(97685),l=n(67294),c=n(94184),u=n.n(c),s=n(48555),f=n(42550),d=n(61975),v=n(21687),p=n(24308),m=n(25378),y=l.createContext("default"),g=function(e){var t=e.children,n=e.size;return l.createElement(y.Consumer,null,(function(e){return l.createElement(y.Provider,{value:n||e},t)}))},h=y,b=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n},Z=function(e,t){var n,c,y=l.useContext(h),g=l.useState(1),Z=(0,a.Z)(g,2),C=Z[0],E=Z[1],x=l.useState(!1),P=(0,a.Z)(x,2),w=P[0],N=P[1],S=l.useState(!0),M=(0,a.Z)(S,2),k=M[0],I=M[1],O=l.useRef(),R=l.useRef(),K=(0,f.sQ)(t,O),A=l.useContext(d.E_).getPrefixCls,T=function(){if(R.current&&O.current){var t=R.current.offsetWidth,n=O.current.offsetWidth;if(0!==t&&0!==n){var r=e.gap,o=void 0===r?4:r;2*o<n&&E(n-2*o<t?(n-2*o)/t:1)}}};l.useEffect((function(){N(!0)}),[]),l.useEffect((function(){I(!0),E(1)}),[e.src]),l.useEffect((function(){T()}),[e.gap]);var D=e.prefixCls,L=e.shape,z=e.size,_=e.src,j=e.srcSet,V=e.icon,W=e.className,F=e.alt,H=e.draggable,X=e.children,q=e.crossOrigin,B=b(e,["prefixCls","shape","size","src","srcSet","icon","className","alt","draggable","children","crossOrigin"]),G="default"===z?y:z,U=Object.keys("object"===(0,i.Z)(G)&&G||{}).some((function(e){return["xs","sm","md","lg","xl","xxl"].includes(e)})),Y=(0,m.Z)(U),Q=l.useMemo((function(){if("object"!==(0,i.Z)(G))return{};var e=p.c4.find((function(e){return Y[e]})),t=G[e];return t?{width:t,height:t,lineHeight:"".concat(t,"px"),fontSize:V?t/2:18}:{}}),[Y,G]);(0,v.Z)(!("string"===typeof V&&V.length>2),"Avatar","`icon` is using ReactNode instead of string naming in v4. Please check `".concat(V,"` at https://ant.design/components/icon"));var J,$=A("avatar",D),ee=u()((n={},(0,o.Z)(n,"".concat($,"-lg"),"large"===G),(0,o.Z)(n,"".concat($,"-sm"),"small"===G),n)),te=l.isValidElement(_),ne=u()($,ee,(c={},(0,o.Z)(c,"".concat($,"-").concat(L),!!L),(0,o.Z)(c,"".concat($,"-image"),te||_&&k),(0,o.Z)(c,"".concat($,"-icon"),!!V),c),W),re="number"===typeof G?{width:G,height:G,lineHeight:"".concat(G,"px"),fontSize:V?G/2:18}:{};if("string"===typeof _&&k)J=l.createElement("img",{src:_,draggable:H,srcSet:j,onError:function(){var t=e.onError;!1!==(t?t():void 0)&&I(!1)},alt:F,crossOrigin:q});else if(te)J=_;else if(V)J=V;else if(w||1!==C){var oe="scale(".concat(C,") translateX(-50%)"),ie={msTransform:oe,WebkitTransform:oe,transform:oe},ae="number"===typeof G?{lineHeight:"".concat(G,"px")}:{};J=l.createElement(s.Z,{onResize:T},l.createElement("span",{className:"".concat($,"-string"),ref:function(e){R.current=e},style:(0,r.Z)((0,r.Z)({},ae),ie)},X))}else J=l.createElement("span",{className:"".concat($,"-string"),style:{opacity:0},ref:function(e){R.current=e}},X);return delete B.onError,delete B.gap,l.createElement("span",(0,r.Z)({},B,{style:(0,r.Z)((0,r.Z)((0,r.Z)({},re),Q),B.style),className:ne,ref:K}),J)},C=l.forwardRef(Z);C.displayName="Avatar",C.defaultProps={shape:"circle",size:"default"};var E=C,x=n(50344),P=n(96159),w=n(36084),N=function(e){return e?"function"===typeof e?e():e:null},S=n(33603),M=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n},k=l.forwardRef((function(e,t){var n=e.prefixCls,o=e.title,i=e.content,a=M(e,["prefixCls","title","content"]),c=l.useContext(d.E_).getPrefixCls,u=c("popover",n),s=c();return l.createElement(w.Z,(0,r.Z)({},a,{prefixCls:u,ref:t,overlay:function(e){if(o||i)return l.createElement(l.Fragment,null,o&&l.createElement("div",{className:"".concat(e,"-title")},N(o)),l.createElement("div",{className:"".concat(e,"-inner-content")},N(i)))}(u),transitionName:(0,S.m)(s,"zoom-big",a.transitionName)}))}));k.displayName="Popover",k.defaultProps={placement:"top",trigger:"hover",mouseEnterDelay:.1,mouseLeaveDelay:.1,overlayStyle:{}};var I=k,O=function(e){var t=l.useContext(d.E_),n=t.getPrefixCls,r=t.direction,i=e.prefixCls,a=e.className,c=void 0===a?"":a,s=e.maxCount,f=e.maxStyle,v=e.size,p=n("avatar-group",i),m=u()(p,(0,o.Z)({},"".concat(p,"-rtl"),"rtl"===r),c),y=e.children,h=e.maxPopoverPlacement,b=void 0===h?"top":h,Z=e.maxPopoverTrigger,C=void 0===Z?"hover":Z,w=(0,x.Z)(y).map((function(e,t){return(0,P.Tm)(e,{key:"avatar-key-".concat(t)})})),N=w.length;if(s&&s<N){var S=w.slice(0,s),M=w.slice(s,N);return S.push(l.createElement(I,{key:"avatar-popover-key",content:M,trigger:C,placement:b,overlayClassName:"".concat(p,"-popover")},l.createElement(E,{style:f},"+".concat(N-s)))),l.createElement(g,{size:v},l.createElement("div",{className:m,style:e.style},S))}return l.createElement(g,{size:v},l.createElement("div",{className:m,style:e.style},w))},R=E;R.Group=O;var K=R},25378:function(e,t,n){var r=n(67294),o=n(57838),i=n(24308);t.Z=function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=(0,r.useRef)({}),n=(0,o.Z)();return(0,r.useEffect)((function(){var r=i.ZP.subscribe((function(r){t.current=r,e&&n()}));return function(){return i.ZP.unsubscribe(r)}}),[]),t.current}},56180:function(e,t,n){n.d(t,{Z:function(){return y}});var r=n(4942),o=n(1413),i=n(97685),a=n(91),l=n(67294),c=n(51169),u=n(94184),s=n.n(u),f={adjustX:1,adjustY:1},d=[0,0],v={topLeft:{points:["bl","tl"],overflow:f,offset:[0,-4],targetOffset:d},topCenter:{points:["bc","tc"],overflow:f,offset:[0,-4],targetOffset:d},topRight:{points:["br","tr"],overflow:f,offset:[0,-4],targetOffset:d},bottomLeft:{points:["tl","bl"],overflow:f,offset:[0,4],targetOffset:d},bottomCenter:{points:["tc","bc"],overflow:f,offset:[0,4],targetOffset:d},bottomRight:{points:["tr","br"],overflow:f,offset:[0,4],targetOffset:d}},p=["arrow","prefixCls","transitionName","animation","align","placement","placements","getPopupContainer","showAction","hideAction","overlayClassName","overlayStyle","visible","trigger"];function m(e,t){var n=e.arrow,u=void 0!==n&&n,f=e.prefixCls,d=void 0===f?"rc-dropdown":f,m=e.transitionName,y=e.animation,g=e.align,h=e.placement,b=void 0===h?"bottomLeft":h,Z=e.placements,C=void 0===Z?v:Z,E=e.getPopupContainer,x=e.showAction,P=e.hideAction,w=e.overlayClassName,N=e.overlayStyle,S=e.visible,M=e.trigger,k=void 0===M?["hover"]:M,I=(0,a.Z)(e,p),O=l.useState(),R=(0,i.Z)(O,2),K=R[0],A=R[1],T="visible"in e?S:K,D=l.useRef(null);l.useImperativeHandle(t,(function(){return D.current}));var L=function(){var t=e.overlay;return"function"===typeof t?t():t},z=function(t){var n=e.onOverlayClick,r=L().props;A(!1),n&&n(t),r.onClick&&r.onClick(t)},_=function(){var e=L(),t={prefixCls:"".concat(d,"-menu"),onClick:z};return"string"===typeof e.type&&delete t.prefixCls,l.createElement(l.Fragment,null,u&&l.createElement("div",{className:"".concat(d,"-arrow")}),l.cloneElement(e,t))},j=P;return j||-1===k.indexOf("contextMenu")||(j=["click"]),l.createElement(c.Z,(0,o.Z)((0,o.Z)({builtinPlacements:C},I),{},{prefixCls:d,ref:D,popupClassName:s()(w,(0,r.Z)({},"".concat(d,"-show-arrow"),u)),popupStyle:N,action:k,showAction:x,hideAction:j||[],popupPlacement:b,popupAlign:g,popupTransitionName:m,popupAnimation:y,popupVisible:T,stretch:function(){var t=e.minOverlayWidthMatchTrigger,n=e.alignPoint;return"minOverlayWidthMatchTrigger"in e?t:!n}()?"minWidth":"",popup:"function"===typeof e.overlay?_:_(),onPopupVisibleChange:function(t){var n=e.onVisibleChange;A(t),"function"===typeof n&&n(t)},getPopupContainer:E}),function(){var t=e.children,n=t.props?t.props:{},r=s()(n.className,function(){var t=e.openClassName;return void 0!==t?t:"".concat(d,"-open")}());return T&&t?l.cloneElement(t,{className:r}):t}())}var y=l.forwardRef(m)},33203:function(e,t,n){n.d(t,{iz:function(){return We},ck:function(){return B},BW:function(){return Ve},sN:function(){return B},Wd:function(){return pe},ZP:function(){return Xe},Xl:function(){return Fe}});var r=n(87462),o=n(4942),i=n(1413),a=n(74902),l=n(97685),c=n(91),u=n(67294),s=n(94184),f=n.n(s),d=n(96774),v=n.n(d),p=n(21770),m=n(80334),y=n(34243),g=n(15671),h=n(43144),b=n(32531),Z=n(73568),C=n(15105),E=n(98423),x=n(56982),P=["children","locked"],w=u.createContext(null);function N(e){var t=e.children,n=e.locked,r=(0,c.Z)(e,P),o=u.useContext(w),a=(0,x.Z)((function(){return function(e,t){var n=(0,i.Z)({},e);return Object.keys(t).forEach((function(e){var r=t[e];void 0!==r&&(n[e]=r)})),n}(o,r)}),[o,r],(function(e,t){return!n&&(e[0]!==t[0]||!v()(e[1],t[1]))}));return u.createElement(w.Provider,{value:a},t)}function S(e,t,n,r){var o=u.useContext(w),i=o.activeKey,a=o.onActive,l=o.onInactive,c={active:i===e};return t||(c.onMouseEnter=function(t){null===n||void 0===n||n({key:e,domEvent:t}),a(e)},c.onMouseLeave=function(t){null===r||void 0===r||r({key:e,domEvent:t}),l(e)}),c}var M=["item"];function k(e){var t=e.item,n=(0,c.Z)(e,M);return Object.defineProperty(n,"item",{get:function(){return(0,m.ZP)(!1,"`info.item` is deprecated since we will move to function component that not provides React Node instance in future."),t}}),n}function I(e){var t=e.icon,n=e.props,r=e.children;return("function"===typeof t?u.createElement(t,(0,i.Z)({},n)):t)||r||null}function O(e){var t=u.useContext(w),n=t.mode,r=t.rtl,o=t.inlineIndent;if("inline"!==n)return null;return r?{paddingRight:e*o}:{paddingLeft:e*o}}var R=[],K=u.createContext(null);function A(){return u.useContext(K)}var T=u.createContext(R);function D(e){var t=u.useContext(T);return u.useMemo((function(){return void 0!==e?[].concat((0,a.Z)(t),[e]):t}),[t,e])}var L=u.createContext(null),z=u.createContext(null);function _(e,t){return void 0===e?null:"".concat(e,"-").concat(t)}function j(e){return _(u.useContext(z),e)}var V=u.createContext({}),W=["title","attribute","elementRef"],F=["style","className","eventKey","warnKey","disabled","itemIcon","children","role","onMouseEnter","onMouseLeave","onClick","onKeyDown","onFocus"],H=["active"],X=function(e){(0,b.Z)(n,e);var t=(0,Z.Z)(n);function n(){return(0,g.Z)(this,n),t.apply(this,arguments)}return(0,h.Z)(n,[{key:"render",value:function(){var e=this.props,t=e.title,n=e.attribute,o=e.elementRef,i=(0,c.Z)(e,W),a=(0,E.Z)(i,["eventKey"]);return(0,m.ZP)(!n,"`attribute` of Menu.Item is deprecated. Please pass attribute directly."),u.createElement(y.Z.Item,(0,r.Z)({},n,{title:"string"===typeof t?t:void 0},a,{ref:o}))}}]),n}(u.Component),q=function(e){var t,n=e.style,l=e.className,s=e.eventKey,d=(e.warnKey,e.disabled),v=e.itemIcon,p=e.children,m=e.role,y=e.onMouseEnter,g=e.onMouseLeave,h=e.onClick,b=e.onKeyDown,Z=e.onFocus,E=(0,c.Z)(e,F),x=j(s),P=u.useContext(w),N=P.prefixCls,M=P.onItemClick,R=P.disabled,K=P.overflowDisabled,A=P.itemIcon,T=P.selectedKeys,L=P.onActive,z=u.useContext(V)._internalRenderMenuItem,_="".concat(N,"-item"),W=u.useRef(),q=u.useRef(),B=R||d,G=D(s);var U=function(e){return{key:s,keyPath:(0,a.Z)(G).reverse(),item:W.current,domEvent:e}},Y=v||A,Q=S(s,B,y,g),J=Q.active,$=(0,c.Z)(Q,H),ee=T.includes(s),te=O(G.length),ne={};"option"===e.role&&(ne["aria-selected"]=ee);var re=u.createElement(X,(0,r.Z)({ref:W,elementRef:q,role:null===m?"none":m||"menuitem",tabIndex:d?null:-1,"data-menu-id":K&&x?null:x},E,$,ne,{component:"li","aria-disabled":d,style:(0,i.Z)((0,i.Z)({},te),n),className:f()(_,(t={},(0,o.Z)(t,"".concat(_,"-active"),J),(0,o.Z)(t,"".concat(_,"-selected"),ee),(0,o.Z)(t,"".concat(_,"-disabled"),B),t),l),onClick:function(e){if(!B){var t=U(e);null===h||void 0===h||h(k(t)),M(t)}},onKeyDown:function(e){if(null===b||void 0===b||b(e),e.which===C.Z.ENTER){var t=U(e);null===h||void 0===h||h(k(t)),M(t)}},onFocus:function(e){L(s),null===Z||void 0===Z||Z(e)}}),p,u.createElement(I,{props:(0,i.Z)((0,i.Z)({},e),{},{isSelected:ee}),icon:Y}));return z&&(re=z(re,e)),re};var B=function(e){var t=e.eventKey,n=A(),r=D(t);return u.useEffect((function(){if(n)return n.registerPath(t,r),function(){n.unregisterPath(t,r)}}),[r]),n?null:u.createElement(q,e)},G=n(50344);function U(e,t){return(0,G.Z)(e).map((function(e,n){if(u.isValidElement(e)){var r,o,i=e.key,l=null!==(r=null===(o=e.props)||void 0===o?void 0:o.eventKey)&&void 0!==r?r:i;(null===l||void 0===l)&&(l="tmp_key-".concat([].concat((0,a.Z)(t),[n]).join("-")));var c={key:l,eventKey:l};return u.cloneElement(e,c)}return e}))}function Y(e){var t=u.useRef(e);t.current=e;var n=u.useCallback((function(){for(var e,n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];return null===(e=t.current)||void 0===e?void 0:e.call.apply(e,[t].concat(r))}),[]);return e?n:void 0}var Q=["className","children"],J=function(e,t){var n=e.className,o=e.children,i=(0,c.Z)(e,Q),a=u.useContext(w),l=a.prefixCls,s=a.mode,d=a.rtl;return u.createElement("ul",(0,r.Z)({className:f()(l,d&&"".concat(l,"-rtl"),"".concat(l,"-sub"),"".concat(l,"-").concat("inline"===s?"inline":"vertical"),n)},i,{"data-menu-list":!0,ref:t}),o)},$=u.forwardRef(J);$.displayName="SubMenuList";var ee=$,te=n(51169),ne=n(75164),re={adjustX:1,adjustY:1},oe={topLeft:{points:["bl","tl"],overflow:re,offset:[0,-7]},bottomLeft:{points:["tl","bl"],overflow:re,offset:[0,7]},leftTop:{points:["tr","tl"],overflow:re,offset:[-4,0]},rightTop:{points:["tl","tr"],overflow:re,offset:[4,0]}},ie={topLeft:{points:["bl","tl"],overflow:re,offset:[0,-7]},bottomLeft:{points:["tl","bl"],overflow:re,offset:[0,7]},rightTop:{points:["tr","tl"],overflow:re,offset:[-4,0]},leftTop:{points:["tl","tr"],overflow:re,offset:[4,0]}};function ae(e,t,n){return t||(n?n[e]||n.other:void 0)}var le={horizontal:"bottomLeft",vertical:"rightTop","vertical-left":"rightTop","vertical-right":"leftTop"};function ce(e){var t=e.prefixCls,n=e.visible,r=e.children,a=e.popup,c=e.popupClassName,s=e.popupOffset,d=e.disabled,v=e.mode,p=e.onVisibleChange,m=u.useContext(w),y=m.getPopupContainer,g=m.rtl,h=m.subMenuOpenDelay,b=m.subMenuCloseDelay,Z=m.builtinPlacements,C=m.triggerSubMenuAction,E=m.forceSubMenuRender,x=m.motion,P=m.defaultMotions,N=u.useState(!1),S=(0,l.Z)(N,2),M=S[0],k=S[1],I=g?(0,i.Z)((0,i.Z)({},ie),Z):(0,i.Z)((0,i.Z)({},oe),Z),O=le[v],R=ae(v,x,P),K=(0,i.Z)((0,i.Z)({},R),{},{leavedClassName:"".concat(t,"-hidden"),removeOnLeave:!1,motionAppear:!0}),A=u.useRef();return u.useEffect((function(){return A.current=(0,ne.Z)((function(){k(n)})),function(){ne.Z.cancel(A.current)}}),[n]),u.createElement(te.Z,{prefixCls:t,popupClassName:f()("".concat(t,"-popup"),(0,o.Z)({},"".concat(t,"-rtl"),g),c),stretch:"horizontal"===v?"minWidth":null,getPopupContainer:y,builtinPlacements:I,popupPlacement:O,popupVisible:M,popup:a,popupAlign:s&&{offset:s},action:d?[]:[C],mouseEnterDelay:h,mouseLeaveDelay:b,onPopupVisibleChange:p,forceRender:E,popupMotion:K},r)}var ue=n(93481);function se(e){var t=e.id,n=e.open,o=e.keyPath,a=e.children,c="inline",s=u.useContext(w),f=s.prefixCls,d=s.forceSubMenuRender,v=s.motion,p=s.defaultMotions,m=s.mode,y=u.useRef(!1);y.current=m===c;var g=u.useState(!y.current),h=(0,l.Z)(g,2),b=h[0],Z=h[1],C=!!y.current&&n;u.useEffect((function(){y.current&&Z(!1)}),[m]);var E=(0,i.Z)({},ae(c,v,p));o.length>1&&(E.motionAppear=!1);var x=E.onVisibleChanged;return E.onVisibleChanged=function(e){return y.current||e||Z(!0),null===x||void 0===x?void 0:x(e)},b?null:u.createElement(N,{mode:c,locked:!y.current},u.createElement(ue.Z,(0,r.Z)({visible:C},E,{forceRender:d,removeOnLeave:!1,leavedClassName:"".concat(f,"-hidden")}),(function(e){var n=e.className,r=e.style;return u.createElement(ee,{id:t,className:n,style:r},a)})))}var fe=["style","className","title","eventKey","warnKey","disabled","internalPopupClose","children","itemIcon","expandIcon","popupClassName","popupOffset","onClick","onMouseEnter","onMouseLeave","onTitleClick","onTitleMouseEnter","onTitleMouseLeave"],de=["active"],ve=function(e){var t,n=e.style,a=e.className,s=e.title,d=e.eventKey,v=(e.warnKey,e.disabled),p=e.internalPopupClose,m=e.children,g=e.itemIcon,h=e.expandIcon,b=e.popupClassName,Z=e.popupOffset,C=e.onClick,E=e.onMouseEnter,x=e.onMouseLeave,P=e.onTitleClick,M=e.onTitleMouseEnter,R=e.onTitleMouseLeave,K=(0,c.Z)(e,fe),A=j(d),T=u.useContext(w),z=T.prefixCls,_=T.mode,W=T.openKeys,F=T.disabled,H=T.overflowDisabled,X=T.activeKey,q=T.selectedKeys,B=T.itemIcon,G=T.expandIcon,U=T.onItemClick,Q=T.onOpenChange,J=T.onActive,$=u.useContext(V)._internalRenderSubMenuItem,te=u.useContext(L).isSubPathKey,ne=D(),re="".concat(z,"-submenu"),oe=F||v,ie=u.useRef(),ae=u.useRef();var le=g||B,ue=h||G,ve=W.includes(d),pe=!H&&ve,me=te(q,d),ye=S(d,oe,M,R),ge=ye.active,he=(0,c.Z)(ye,de),be=u.useState(!1),Ze=(0,l.Z)(be,2),Ce=Ze[0],Ee=Ze[1],xe=function(e){oe||Ee(e)},Pe=u.useMemo((function(){return ge||"inline"!==_&&(Ce||te([X],d))}),[_,ge,X,Ce,d,te]),we=O(ne.length),Ne=Y((function(e){null===C||void 0===C||C(k(e)),U(e)})),Se=A&&"".concat(A,"-popup"),Me=u.createElement("div",(0,r.Z)({role:"menuitem",style:we,className:"".concat(re,"-title"),tabIndex:oe?null:-1,ref:ie,title:"string"===typeof s?s:null,"data-menu-id":H&&A?null:A,"aria-expanded":pe,"aria-haspopup":!0,"aria-controls":Se,"aria-disabled":oe,onClick:function(e){oe||(null===P||void 0===P||P({key:d,domEvent:e}),"inline"===_&&Q(d,!ve))},onFocus:function(){J(d)}},he),s,u.createElement(I,{icon:"horizontal"!==_?ue:null,props:(0,i.Z)((0,i.Z)({},e),{},{isOpen:pe,isSubMenu:!0})},u.createElement("i",{className:"".concat(re,"-arrow")}))),ke=u.useRef(_);if("inline"!==_&&(ke.current=ne.length>1?"vertical":_),!H){var Ie=ke.current;Me=u.createElement(ce,{mode:Ie,prefixCls:re,visible:!p&&pe&&"inline"!==_,popupClassName:b,popupOffset:Z,popup:u.createElement(N,{mode:"horizontal"===Ie?"vertical":Ie},u.createElement(ee,{id:Se,ref:ae},m)),disabled:oe,onVisibleChange:function(e){"inline"!==_&&Q(d,e)}},Me)}var Oe=u.createElement(y.Z.Item,(0,r.Z)({role:"none"},K,{component:"li",style:n,className:f()(re,"".concat(re,"-").concat(_),a,(t={},(0,o.Z)(t,"".concat(re,"-open"),pe),(0,o.Z)(t,"".concat(re,"-active"),Pe),(0,o.Z)(t,"".concat(re,"-selected"),me),(0,o.Z)(t,"".concat(re,"-disabled"),oe),t)),onMouseEnter:function(e){xe(!0),null===E||void 0===E||E({key:d,domEvent:e})},onMouseLeave:function(e){xe(!1),null===x||void 0===x||x({key:d,domEvent:e})}}),Me,!H&&u.createElement(se,{id:Se,open:pe,keyPath:ne},m));return $&&(Oe=$(Oe,e)),u.createElement(N,{onItemClick:Ne,mode:"horizontal"===_?"vertical":_,itemIcon:le,expandIcon:ue},Oe)};function pe(e){var t,n=e.eventKey,r=e.children,o=D(n),i=U(r,o),a=A();return u.useEffect((function(){if(a)return a.registerPath(n,o),function(){a.unregisterPath(n,o)}}),[o]),t=a?i:u.createElement(ve,e,i),u.createElement(T.Provider,{value:o},t)}var me=n(5110);function ye(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if((0,me.Z)(e)){var n=e.nodeName.toLowerCase(),r=["input","select","textarea","button"].includes(n)||e.isContentEditable||"a"===n&&!!e.getAttribute("href"),o=e.getAttribute("tabindex"),i=Number(o),a=null;return o&&!Number.isNaN(i)?a=i:r&&null===a&&(a=0),r&&e.disabled&&(a=null),null!==a&&(a>=0||t&&a<0)}return!1}function ge(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=(0,a.Z)(e.querySelectorAll("*")).filter((function(e){return ye(e,t)}));return ye(e,t)&&n.unshift(e),n}var he=C.Z.LEFT,be=C.Z.RIGHT,Ze=C.Z.UP,Ce=C.Z.DOWN,Ee=C.Z.ENTER,xe=C.Z.ESC,Pe=C.Z.HOME,we=C.Z.END,Ne=[Ze,Ce,he,be];function Se(e,t){return ge(e,!0).filter((function(e){return t.has(e)}))}function Me(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;if(!e)return null;var o=Se(e,t),i=o.length,a=o.findIndex((function(e){return n===e}));return r<0?-1===a?a=i-1:a-=1:r>0&&(a+=1),o[a=(a+i)%i]}function ke(e,t,n,r,i,a,l,c,s,f){var d=u.useRef(),v=u.useRef();v.current=t;var p=function(){ne.Z.cancel(d.current)};return u.useEffect((function(){return function(){p()}}),[]),function(u){var m=u.which;if([].concat(Ne,[Ee,xe,Pe,we]).includes(m)){var y,g,h,b=function(){return y=new Set,g=new Map,h=new Map,a().forEach((function(e){var t=document.querySelector("[data-menu-id='".concat(_(r,e),"']"));t&&(y.add(t),h.set(t,e),g.set(e,t))})),y};b();var Z=function(e,t){for(var n=e||document.activeElement;n;){if(t.has(n))return n;n=n.parentElement}return null}(g.get(t),y),C=h.get(Z),E=function(e,t,n,r){var i,a,l,c,u="prev",s="next",f="children",d="parent";if("inline"===e&&r===Ee)return{inlineTrigger:!0};var v=(i={},(0,o.Z)(i,Ze,u),(0,o.Z)(i,Ce,s),i),p=(a={},(0,o.Z)(a,he,n?s:u),(0,o.Z)(a,be,n?u:s),(0,o.Z)(a,Ce,f),(0,o.Z)(a,Ee,f),a),m=(l={},(0,o.Z)(l,Ze,u),(0,o.Z)(l,Ce,s),(0,o.Z)(l,Ee,f),(0,o.Z)(l,xe,d),(0,o.Z)(l,he,n?f:d),(0,o.Z)(l,be,n?d:f),l);switch(null===(c={inline:v,horizontal:p,vertical:m,inlineSub:v,horizontalSub:m,verticalSub:m}["".concat(e).concat(t?"":"Sub")])||void 0===c?void 0:c[r]){case u:return{offset:-1,sibling:!0};case s:return{offset:1,sibling:!0};case d:return{offset:-1,sibling:!1};case f:return{offset:1,sibling:!1};default:return null}}(e,1===l(C,!0).length,n,m);if(!E&&m!==Pe&&m!==we)return;(Ne.includes(m)||[Pe,we].includes(m))&&u.preventDefault();var x=function(e){if(e){var t=e,n=e.querySelector("a");(null===n||void 0===n?void 0:n.getAttribute("href"))&&(t=n);var r=h.get(e);c(r),p(),d.current=(0,ne.Z)((function(){v.current===r&&t.focus()}))}};if([Pe,we].includes(m)||E.sibling||!Z){var P,w,N=Se(P=Z&&"inline"!==e?function(e){for(var t=e;t;){if(t.getAttribute("data-menu-list"))return t;t=t.parentElement}return null}(Z):i.current,y);w=m===Pe?N[0]:m===we?N[N.length-1]:Me(P,y,Z,E.offset),x(w)}else if(E.inlineTrigger)s(C);else if(E.offset>0)s(C,!0),p(),d.current=(0,ne.Z)((function(){b();var e=Z.getAttribute("aria-controls"),t=Me(document.getElementById(e),y);x(t)}),5);else if(E.offset<0){var S=l(C,!0),M=S[S.length-2],k=g.get(M);s(M,!1),x(k)}}null===f||void 0===f||f(u)}}var Ie=Math.random().toFixed(5).toString().slice(2),Oe=0;var Re="__RC_UTIL_PATH_SPLIT__",Ke=function(e){return e.join(Re)},Ae="rc-menu-more";function Te(){var e=u.useState({}),t=(0,l.Z)(e,2)[1],n=(0,u.useRef)(new Map),r=(0,u.useRef)(new Map),o=u.useState([]),i=(0,l.Z)(o,2),c=i[0],s=i[1],f=(0,u.useRef)(0),d=(0,u.useRef)(!1),v=(0,u.useCallback)((function(e,o){var i=Ke(o);r.current.set(i,e),n.current.set(e,i),f.current+=1;var a,l=f.current;a=function(){l===f.current&&(d.current||t({}))},Promise.resolve().then(a)}),[]),p=(0,u.useCallback)((function(e,t){var o=Ke(t);r.current.delete(o),n.current.delete(e)}),[]),m=(0,u.useCallback)((function(e){s(e)}),[]),y=(0,u.useCallback)((function(e,t){var r=n.current.get(e)||"",o=r.split(Re);return t&&c.includes(o[0])&&o.unshift(Ae),o}),[c]),g=(0,u.useCallback)((function(e,t){return e.some((function(e){return y(e,!0).includes(t)}))}),[y]),h=(0,u.useCallback)((function(e){var t="".concat(n.current.get(e)).concat(Re),o=new Set;return(0,a.Z)(r.current.keys()).forEach((function(e){e.startsWith(t)&&o.add(r.current.get(e))})),o}),[]);return u.useEffect((function(){return function(){d.current=!0}}),[]),{registerPath:v,unregisterPath:p,refreshOverflowKeys:m,isSubPathKey:g,getKeyPath:y,getKeys:function(){var e=(0,a.Z)(n.current.keys());return c.length&&e.push(Ae),e},getSubPathKeys:h}}var De=["prefixCls","style","className","tabIndex","children","direction","id","mode","inlineCollapsed","disabled","disabledOverflow","subMenuOpenDelay","subMenuCloseDelay","forceSubMenuRender","defaultOpenKeys","openKeys","activeKey","defaultActiveFirst","selectable","multiple","defaultSelectedKeys","selectedKeys","onSelect","onDeselect","inlineIndent","motion","defaultMotions","triggerSubMenuAction","builtinPlacements","itemIcon","expandIcon","overflowedIndicator","overflowedIndicatorPopupClassName","getPopupContainer","onClick","onOpenChange","onKeyDown","openAnimation","openTransitionName","_internalRenderMenuItem","_internalRenderSubMenuItem"],Le=[],ze=["className","title","eventKey","children"],_e=["children"],je=function(e){var t=e.className,n=e.title,o=(e.eventKey,e.children),i=(0,c.Z)(e,ze),a=u.useContext(w).prefixCls,l="".concat(a,"-item-group");return u.createElement("li",(0,r.Z)({},i,{onClick:function(e){return e.stopPropagation()},className:f()(l,t)}),u.createElement("div",{className:"".concat(l,"-title"),title:"string"===typeof n?n:void 0},n),u.createElement("ul",{className:"".concat(l,"-list")},o))};function Ve(e){var t=e.children,n=(0,c.Z)(e,_e),r=U(t,D(n.eventKey));return A()?r:u.createElement(je,(0,E.Z)(n,["warnKey"]),r)}function We(e){var t=e.className,n=e.style,r=u.useContext(w).prefixCls;return A()?null:u.createElement("li",{className:f()("".concat(r,"-item-divider"),t),style:n})}var Fe=D,He=function(e){var t,n,s=e.prefixCls,d=void 0===s?"rc-menu":s,m=e.style,g=e.className,h=e.tabIndex,b=void 0===h?0:h,Z=e.children,C=e.direction,E=e.id,x=e.mode,P=void 0===x?"vertical":x,w=e.inlineCollapsed,S=e.disabled,M=e.disabledOverflow,I=e.subMenuOpenDelay,O=void 0===I?.1:I,R=e.subMenuCloseDelay,A=void 0===R?.1:R,T=e.forceSubMenuRender,D=e.defaultOpenKeys,_=e.openKeys,j=e.activeKey,W=e.defaultActiveFirst,F=e.selectable,H=void 0===F||F,X=e.multiple,q=void 0!==X&&X,G=e.defaultSelectedKeys,Q=e.selectedKeys,J=e.onSelect,$=e.onDeselect,ee=e.inlineIndent,te=void 0===ee?24:ee,ne=e.motion,re=e.defaultMotions,oe=e.triggerSubMenuAction,ie=void 0===oe?"hover":oe,ae=e.builtinPlacements,le=e.itemIcon,ce=e.expandIcon,ue=e.overflowedIndicator,se=void 0===ue?"...":ue,fe=e.overflowedIndicatorPopupClassName,de=e.getPopupContainer,ve=e.onClick,me=e.onOpenChange,ye=e.onKeyDown,ge=(e.openAnimation,e.openTransitionName,e._internalRenderMenuItem),he=e._internalRenderSubMenuItem,be=(0,c.Z)(e,De),Ze=U(Z,Le),Ce=u.useState(!1),Ee=(0,l.Z)(Ce,2),xe=Ee[0],Pe=Ee[1],we=u.useRef(),Ne=function(e){var t=(0,p.Z)(e,{value:e}),n=(0,l.Z)(t,2),r=n[0],o=n[1];return u.useEffect((function(){Oe+=1;var e="".concat(Ie,"-").concat(Oe);o("rc-menu-uuid-".concat(e))}),[]),r}(E),Se="rtl"===C;var Me=u.useMemo((function(){return"inline"!==P&&"vertical"!==P||!w?[P,!1]:["vertical",w]}),[P,w]),Re=(0,l.Z)(Me,2),Ke=Re[0],ze=Re[1],_e=u.useState(0),je=(0,l.Z)(_e,2),Ve=je[0],We=je[1],Fe=Ve>=Ze.length-1||"horizontal"!==Ke||M,He=(0,p.Z)(D,{value:_,postState:function(e){return e||Le}}),Xe=(0,l.Z)(He,2),qe=Xe[0],Be=Xe[1],Ge=function(e){Be(e),null===me||void 0===me||me(e)},Ue=u.useState(qe),Ye=(0,l.Z)(Ue,2),Qe=Ye[0],Je=Ye[1],$e="inline"===Ke,et=u.useRef(!1);u.useEffect((function(){$e&&Je(qe)}),[qe]),u.useEffect((function(){et.current?$e?Be(Qe):Ge(Le):et.current=!0}),[$e]);var tt=Te(),nt=tt.registerPath,rt=tt.unregisterPath,ot=tt.refreshOverflowKeys,it=tt.isSubPathKey,at=tt.getKeyPath,lt=tt.getKeys,ct=tt.getSubPathKeys,ut=u.useMemo((function(){return{registerPath:nt,unregisterPath:rt}}),[nt,rt]),st=u.useMemo((function(){return{isSubPathKey:it}}),[it]);u.useEffect((function(){ot(Fe?Le:Ze.slice(Ve+1).map((function(e){return e.key})))}),[Ve,Fe]);var ft=(0,p.Z)(j||W&&(null===(t=Ze[0])||void 0===t?void 0:t.key),{value:j}),dt=(0,l.Z)(ft,2),vt=dt[0],pt=dt[1],mt=Y((function(e){pt(e)})),yt=Y((function(){pt(void 0)})),gt=(0,p.Z)(G||[],{value:Q,postState:function(e){return Array.isArray(e)?e:null===e||void 0===e?Le:[e]}}),ht=(0,l.Z)(gt,2),bt=ht[0],Zt=ht[1],Ct=Y((function(e){null===ve||void 0===ve||ve(k(e)),function(e){if(H){var t,n=e.key,r=bt.includes(n);t=q?r?bt.filter((function(e){return e!==n})):[].concat((0,a.Z)(bt),[n]):[n],Zt(t);var o=(0,i.Z)((0,i.Z)({},e),{},{selectedKeys:t});r?null===$||void 0===$||$(o):null===J||void 0===J||J(o)}!q&&qe.length&&"inline"!==Ke&&Ge(Le)}(e)})),Et=Y((function(e,t){var n=qe.filter((function(t){return t!==e}));if(t)n.push(e);else if("inline"!==Ke){var r=ct(e);n=n.filter((function(e){return!r.has(e)}))}v()(qe,n)||Ge(n)})),xt=Y(de),Pt=ke(Ke,vt,Se,Ne,we,lt,at,pt,(function(e,t){var n=null!==t&&void 0!==t?t:!qe.includes(e);Et(e,n)}),ye);u.useEffect((function(){Pe(!0)}),[]);var wt=u.useMemo((function(){return{_internalRenderMenuItem:ge,_internalRenderSubMenuItem:he}}),[ge,he]),Nt="horizontal"!==Ke||M?Ze:Ze.map((function(e,t){return u.createElement(N,{key:e.key,overflowDisabled:t>Ve},e)})),St=u.createElement(y.Z,(0,r.Z)({id:E,ref:we,prefixCls:"".concat(d,"-overflow"),component:"ul",itemComponent:B,className:f()(d,"".concat(d,"-root"),"".concat(d,"-").concat(Ke),g,(n={},(0,o.Z)(n,"".concat(d,"-inline-collapsed"),ze),(0,o.Z)(n,"".concat(d,"-rtl"),Se),n)),dir:C,style:m,role:"menu",tabIndex:b,data:Nt,renderRawItem:function(e){return e},renderRawRest:function(e){var t=e.length,n=t?Ze.slice(-t):null;return u.createElement(pe,{eventKey:Ae,title:se,disabled:Fe,internalPopupClose:0===t,popupClassName:fe},n)},maxCount:"horizontal"!==Ke||M?y.Z.INVALIDATE:y.Z.RESPONSIVE,ssr:"full","data-menu-list":!0,onVisibleChange:function(e){We(e)},onKeyDown:Pt},be));return u.createElement(V.Provider,{value:wt},u.createElement(z.Provider,{value:Ne},u.createElement(N,{prefixCls:d,mode:Ke,openKeys:qe,rtl:Se,disabled:S,motion:xe?ne:null,defaultMotions:xe?re:null,activeKey:vt,onActive:mt,onInactive:yt,selectedKeys:bt,inlineIndent:te,subMenuOpenDelay:O,subMenuCloseDelay:A,forceSubMenuRender:T,builtinPlacements:ae,triggerSubMenuAction:ie,getPopupContainer:xt,itemIcon:le,expandIcon:ce,onItemClick:Ct,onOpenChange:Et},u.createElement(L.Provider,{value:st},St),u.createElement("div",{style:{display:"none"},"aria-hidden":!0},u.createElement(K.Provider,{value:ut},Ze)))))};He.Item=B,He.SubMenu=pe,He.ItemGroup=Ve,He.Divider=We;var Xe=He}}]);
(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[459],{6390:function(e,n,t){"use strict";t(7294);var s=t(6075),r=t(7454),c=t(5893),i=s.Z.Title;s.Z.Text;n.Z=function(e){var n=e.children;(0,r.a)().user;return(0,c.jsxs)("div",{className:"mb-8",style:{padding:"50px 153px"},children:[(0,c.jsx)(i,{level:2,className:"logo",children:"Sprint Zero"}),n]})}},4919:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return g}});t(7294);var s=t(9008),r=t(6390),c=t(1163),i=t(6075),o=t(423),l=t(5057),u=t(9707),a=t(8715),f=new a.Z.auth.GoogleAuthProvider;new a.Z.auth.OAuthProvider("microsoft.com").setCustomParameters({prompt:"consent",tenant:"0978a8a8-f629-4f7f-ae57-0639051b0f2c"});var h=t(5893),d=i.Z.Title,m=i.Z.Text,x=function(){var e=(0,c.useRouter)(),n=a.Z.auth();return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("div",{className:"flex items-center justify-center mb-4",children:(0,h.jsxs)("div",{children:[(0,h.jsx)(d,{level:1,style:{fontWeight:"normal"},children:"Authenticate Yourself Before You Wreck Yourself"}),(0,h.jsx)(m,{className:"text-xl text-left",children:"Select a provider to create your account"})]})}),(0,h.jsx)("div",{className:"flex flex-col items-center justify-center mt-10",children:(0,h.jsxs)("button",{className:"googleBtn flex items-center m-10",onClick:function(){return function(t){try{n.signInWithPopup(t).then((function(e){o.ZP.success({content:"Successfully logged in",className:"custom-message"})})).then((function(){return e.push("/loginsuccess")}))}catch(s){console.log(s.message),o.ZP.error({content:"An error occurred while trying to log you in",className:"custom-message"})}}(f)},children:[(0,h.jsx)(l.Z,{src:"https://developers.google.com/identity/sign-in/g-normal.png",alt:"microsoft",width:40.32,height:40.32}),(0,h.jsx)("span",{style:{marginLeft:"15px"},children:"Sign in with Google"})]})}),(0,h.jsx)("div",{className:"absolute bottom-20 lg:left-80",children:(0,h.jsx)(u.Z,{onClick:function(){return e.push("/")},children:"Go Back"})})]})},g=function(){return(0,h.jsxs)("div",{children:[(0,h.jsxs)(s.default,{children:[(0,h.jsx)("title",{children:"Login | Sprint Zero"}),(0,h.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,h.jsx)(r.Z,{children:(0,h.jsx)(x,{})})]})}},7156:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/login",function(){return t(4919)}])}},function(e){e.O(0,[758,382,393,141,774,888,179],(function(){return n=7156,e(e.s=n);var n}));var n=e.O();_N_E=n}]);
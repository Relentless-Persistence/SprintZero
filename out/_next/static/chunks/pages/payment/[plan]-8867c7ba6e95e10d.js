(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[218],{6390:function(e,s,t){"use strict";t(7294);var n=t(6075),a=t(7454),r=t(5893),c=n.Z.Title;n.Z.Text;s.Z=function(e){var s=e.children;(0,a.a)().user;return(0,r.jsxs)("div",{className:"mb-8",style:{padding:"50px 153px"},children:[(0,r.jsx)(c,{level:2,className:"logo",children:"Sprint Zero"}),s]})}},5247:function(e,s,t){"use strict";t.r(s),t.d(s,{__N_SSP:function(){return D},default:function(){return z}});var n=t(7294),a=t(9008),r=t(29),c=t(7794),i=t.n(c),l=t(1163),o=t(6075),u=t(3302),m=t(3199),d=t(423),x=t(1230),h=t(5746),p=t(9531),f=t(7049),j=t(2808),g=t(9707),N=t(5035),y=t(6664),v=t(9669),Z=t.n(v),b=t(8762),_=(t(5514),t(5893)),S=o.Z.Title,P=o.Z.Text,w=u.Z.Item,C=m.Z.Option,k={hidePostalCode:!0,iconStyle:"solid",style:{base:{iconColor:"#000",color:"#000",fontWeight:400,fontFamily:"Roboto, Open Sans, Segoe Ui, sans-serif",fontSize:"14px","::placeholder":{color:"#A6AE9D"}},invalid:{iconColor:"red",color:"red"}}},E=function(e){var s=e.selectedPlan,t=e.countries,a=e.ip,c=(0,l.useRouter)(),o=(0,n.useState)(""),v=o[0],E=o[1],T=(0,n.useState)(""),I=T[0],D=T[1],z=(0,n.useState)(""),B=z[0],L=z[1],O=(0,n.useState)(""),R=O[0],U=O[1],q=(0,n.useState)(""),J=q[0],M=q[1],A=(0,n.useState)(!1),F=A[0],X=A[1],$=(0,n.useState)(!1),K=($[0],$[1]),V=(0,n.useState)(!0),W=V[0],H=V[1],Q=(0,n.useState)(null),G=Q[0],Y=Q[1],ee=(0,n.useState)(null),se=ee[0],te=ee[1],ne=(0,y.useStripe)(),ae=(0,y.useElements)();(0,n.useEffect)((function(){(function(){var e=(0,r.Z)(i().mark((function e(){var s;return i().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Z().post("/api/create_customer",{ip:a});case 2:s=e.sent,te(s.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()()}),[a]);var re=function(){var e=(0,r.Z)(i().mark((function e(t){var n,a,r,l,o,u;return i().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(H(!0),n=function(){var e="Basic"===s?9.99:99.99;return Math.round(100*(e+ie()+Number.EPSILON))/100},!0!==/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(B)||!F||!R){e.next=28;break}return a={name:"".concat(v," ").concat(I),email:B,address:{country:R,postal_code:J}},e.next=6,ne.createPaymentMethod({type:"card",card:ae.getElement(y.CardElement),billing_details:a});case 6:if(r=e.sent,l=r.error,o=r.paymentMethod,l){e.next=24;break}return e.prev=10,u=o.id,e.next=14,Z().post("/api/payment_intents",{amount:100*n(),id:u});case 14:e.sent.data.success&&((0,b.nx)(!0),d.ZP.loading({content:"Running Card",className:"custom-message"},5e4).then((function(){return d.ZP.success({content:"Card Accepted",className:"custom-message"})})),setTimeout((function(){c.push("/login")}),4e3),K(!0)),e.next=22;break;case 18:e.prev=18,e.t0=e.catch(10),d.ZP.loading({content:"Running Card",className:"custom-message"},2.5).then((function(){return d.ZP.error({content:e.t0.message,className:"custom-message"})})),H(!1);case 22:e.next=26;break;case 24:d.ZP.loading({content:"Validating...",className:"custom-message"},2.5).then((function(){return d.ZP.error({content:l.message,className:"custom-message"})})),H(!1);case 26:e.next=30;break;case 28:d.ZP.loading({content:"Validating...",className:"custom-message"},2.5).then((function(){return d.ZP.error({content:"Details missing",className:"custom-message"})})),H(!1);case 30:case"end":return e.stop()}}),e,null,[[10,18]])})));return function(s){return e.apply(this,arguments)}}(),ce=function(){var e=(0,r.Z)(i().mark((function e(t){var n,r;return i().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n="Basic"===s?"price_1JsrIXIUry2flRTckRVmn2LJ":"price_1JsrIyIUry2flRTca7f6zJ8N",e.next=3,Z().post("/api/create_subscription",{customer:se.id,items:[{price:"price",quantity:1}]});case 3:return e.sent,e.next=6,Z().post("/api/upcoming_invoice",{customer:se.id,country:t,postal_code:J,subscription_items:[{price:n,quantity:1}],ip:a});case 6:200===(r=e.sent).status?Y(r.data):console.log(r.data.message);case 8:case"end":return e.stop()}}),e)})));return function(s){return e.apply(this,arguments)}}(),ie=function(){var e="Basic"===s?9.99:99.99,t=G.total_tax_amounts[0].tax_rate.percentage/100;return Math.round(100*(e*t+Number.EPSILON))/100};return s&&(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)("div",{className:"mb-4",children:[(0,_.jsx)(S,{level:1,style:{fontWeight:"normal"},children:"Hand Over Those Deets"}),(0,_.jsx)(P,{className:"text-xl",children:"Please provide your information below so we can keep our internet service providers happy and continue to evolve this product"})]}),(0,_.jsxs)(u.Z,{onFinish:re,children:[(0,_.jsxs)("div",{children:[(0,_.jsx)(P,{className:"text-gray-500 font-semibold",style:{fontSize:"16px"},children:"Contact Information"}),(0,_.jsxs)(x.Z,{gutter:[16,16],className:"mt-4",children:[(0,_.jsx)(h.Z,{xs:24,sm:24,lg:14,children:(0,_.jsx)(w,{label:(0,_.jsxs)(P,{className:"flex items-center justify-between text-sm",children:["Full Name ",(0,_.jsx)(N.Z,{className:"ml-2 mr-2"})]}),name:"fullName",rules:[{required:!0,message:"Please input your full name!"}],children:(0,_.jsxs)("div",{className:"flex",children:[(0,_.jsx)(p.Z,{placeholder:"First",onChange:function(e){return E(e.target.value)}}),(0,_.jsx)(p.Z,{className:"ml-2",placeholder:"Last",onChange:function(e){return D(e.target.value)}})]})})}),(0,_.jsx)(h.Z,{xs:24,sm:24,lg:10,children:(0,_.jsx)(w,{label:(0,_.jsxs)(P,{className:"flex items-center justify-between text-sm",children:["Email ",(0,_.jsx)(N.Z,{className:"ml-2 mr-2"})]}),name:"email",rules:[{required:!0,message:"Please input your email!"}],children:(0,_.jsx)(p.Z,{onChange:function(e){return L(e.target.value)}})})})]})]}),(0,_.jsxs)("div",{children:[(0,_.jsx)(P,{className:"text-gray-500 font-semibold",style:{fontSize:"16px"},children:"Credit Card Details"}),(0,_.jsxs)(x.Z,{gutter:[16,16],className:"mt-4",children:[(0,_.jsx)(h.Z,{xs:24,sm:24,lg:10,children:(0,_.jsx)("div",{className:"py-2 px-3 bg-white border border-gray-300 rounded-sm",children:(0,_.jsx)(y.CardElement,{options:k})})}),(0,_.jsx)(h.Z,{xs:24,sm:24,lg:8,children:(0,_.jsx)(w,{label:(0,_.jsxs)(P,{className:"flex items-center justify-between text-sm",children:["ZIP/Postal Code"," ",(0,_.jsx)(N.Z,{className:"ml-2 mr-2"})]}),name:"zip",rules:[{required:!0,message:"Please input your zip/postal code"}],children:(0,_.jsx)(p.Z,{onChange:function(e){return M(e.target.value)}})})}),(0,_.jsx)(h.Z,{xs:24,sm:24,lg:6,children:(0,_.jsx)(w,{label:(0,_.jsxs)(P,{className:"flex items-center justify-between text-sm",children:[(0,_.jsx)("span",{className:"text-red-500 text-lg",children:"*"}),"Country"," ",(0,_.jsx)(N.Z,{className:"ml-2 mr-2"})]}),name:"country",children:(0,_.jsx)("div",{className:"flex",children:(0,_.jsx)(m.Z,{style:{width:"100%"},onChange:function(e){U(e),ce(e)},disabled:""===J,children:t.map((function(e,s){return(0,_.jsx)(C,{value:e.Iso2,children:e.name},s)}))})})})})]})]}),(0,_.jsxs)("div",{children:[(0,_.jsx)(P,{className:"text-gray-500 font-semibold",style:{fontSize:"16px"},children:"Selected Plan"}),(0,_.jsxs)(h.Z,{className:"flex items-center justify-between",children:[(0,_.jsx)(P,{className:"text-xl",children:s}),(0,_.jsxs)(P,{className:"text-xl",children:["$","Basic"===s?9.99:99.99," USD"]})]}),(0,_.jsxs)(h.Z,{className:"flex items-center justify-between mt-4",children:[(0,_.jsxs)(P,{className:"text-xl",children:["Sales Tax @"," ",G?G.total_tax_amounts[0].tax_rate.percentage:"-","%"]}),(0,_.jsxs)(P,{className:"text-xl",children:["$",G?ie():"-"," ","USD"]})]}),(0,_.jsx)(f.Z,{className:"bg-gray-900"}),(0,_.jsxs)(h.Z,{className:"flex items-center justify-between mt-4",children:[(0,_.jsx)(P,{className:"text-xl font-semibold",children:"Total"}),(0,_.jsxs)(P,{className:"text-xl font-semibold",children:["$",G?function(){var e="Basic"===s?9.99:99.99;return Math.round(100*(e+ie()+Number.EPSILON))/100}():"Basic"===s?9.99:99.99," ","USD"]})]}),(0,_.jsxs)(h.Z,{className:"flex items-center justify-start mt-4 mb-8",children:[(0,_.jsx)(j.Z,{checked:F,onChange:function(){G&&(X(!F),H(!!F))}}),(0,_.jsxs)(P,{className:"ml-4",children:["I agree to the"," ",(0,_.jsx)("span",{className:"underline cursor-pointer",children:"Terms of Service"})," ","and ackowledge the"," ",(0,_.jsx)("span",{className:"underline cursor-pointer",children:"Privacy Policy"}),"."]})]}),(0,_.jsxs)(x.Z,{gutter:[16,16],children:[(0,_.jsx)(h.Z,{xs:24,lg:12,children:(0,_.jsx)(g.Z,{type:"primary",htmlType:"submit",block:!0,disabled:W,children:(0,_.jsx)("span",{className:"font-semibold",children:"Submit"})})}),(0,_.jsx)(h.Z,{xs:24,lg:12,children:(0,_.jsx)(g.Z,{danger:!0,type:"ghost",block:!0,onClick:function(){return c.push("/")},children:(0,_.jsx)("span",{className:"font-semibold",children:"Cancel"})})})]})]})]})]})},T=t(6390),I=(0,t(4465).J)("pk_test_51Ji035IUry2flRTc8XUkfCQqzwcBBHiMCDLPmhJNTpDovjA7LnKQTELrmqiw6gy9eaWs973iEEDMKmKxwdj9vt4s00lcvsFZ0i"),D=!0,z=function(e){var s=e.selectedPlan,t=e.countries,n=e.ipData;return(0,_.jsxs)("div",{children:[(0,_.jsxs)(a.default,{children:[(0,_.jsx)("title",{children:"Payment | Sprint Zero"}),(0,_.jsx)("meta",{name:"description",content:"Generated by create next app"}),(0,_.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,_.jsx)(T.Z,{children:(0,_.jsx)(y.Elements,{stripe:I,children:(0,_.jsx)(E,{selectedPlan:s,countries:t.data,ip:n.IPv4})})})]})}},2434:function(e,s,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/payment/[plan]",function(){return t(5247)}])},4654:function(){}},function(e){e.O(0,[714,758,51,246,393,302,391,337,774,888,179],(function(){return s=2434,e(e.s=s);var s}));var s=e.O();_N_E=s}]);
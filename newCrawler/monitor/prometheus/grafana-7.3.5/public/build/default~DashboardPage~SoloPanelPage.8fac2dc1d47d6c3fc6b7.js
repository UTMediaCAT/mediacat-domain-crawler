(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"8M//":function(e,t,n){"use strict";n.d(t,"a",(function(){return v}));var r=n("UvM7"),a=n("NXk7"),o=n("3SGO"),i=n("KyLG"),s=n("GQ3c"),l=n("rd46"),c=n("Obii"),u=n("50r9"),p=n("jL/7"),f=n("HH2e");function d(e,t,n,r,a,o,i){try{var s=e[o](i),l=s.value}catch(e){return void n(e)}s.done?t(l):Promise.resolve(l).then(r,a)}function h(e){return function(){var t=this,n=arguments;return new Promise((function(r,a){var o=e.apply(t,n);function i(e){d(o,r,a,i,s,"next",e)}function s(e){d(o,r,a,i,s,"throw",e)}i(void 0)}))}}function m(e,t,n){return b.apply(this,arguments)}function b(){return(b=h(regeneratorRuntime.mark((function e(t,n,r){var i,s,l;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a.b.getDashboardBySlug(t);case 2:(i=e.sent)&&(s=i.meta.url,-1!==r.indexOf("dashboard-solo")&&(s=s.replace("/d/","/d-solo/")),l=c.locationUtil.stripBaseFromUrl(s),n(Object(o.d)({path:l,partial:!0,replace:!0})));case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function y(e,t,n){return g.apply(this,arguments)}function g(){return(g=h(regeneratorRuntime.mark((function e(t,n,r){var l,u,p,f,d,h;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.prev=0,e.t0=t.routeInfo,e.next=e.t0===s.DashboardRouteInfo.Home?4:e.t0===s.DashboardRouteInfo.Normal?15:e.t0===s.DashboardRouteInfo.New?29:30;break;case 4:return e.next=6,a.b.get("/api/dashboards/home");case 6:if(!(l=e.sent).redirectUri){e.next=11;break}return u=c.locationUtil.stripBaseFromUrl(l.redirectUri),n(Object(o.d)({path:u,replace:!0})),e.abrupt("return",null);case 11:return l.meta.canSave=!1,l.meta.canShare=!1,l.meta.canStar=!1,e.abrupt("return",l);case 15:if("db"!==t.urlType){e.next=18;break}return m(t.urlSlug,n,r().location.path),e.abrupt("return",null);case 18:return p=t.$injector.get("dashboardLoaderSrv"),e.next=21,p.loadDashboard(t.urlType,t.urlSlug,t.urlUid);case 21:if(f=e.sent,!t.fixUrl||!f.meta.url){e.next=28;break}if(d=c.locationUtil.stripBaseFromUrl(f.meta.url),h=r().location.path,d===h){e.next=28;break}return n(Object(o.d)({path:d,partial:!0,replace:!0})),e.abrupt("return",null);case 28:return e.abrupt("return",f);case 29:return e.abrupt("return",w(t.urlFolderId));case 30:throw{message:"Unknown route "+t.routeInfo};case 31:e.next=40;break;case 33:if(e.prev=33,e.t1=e.catch(0),!e.t1.cancelled){e.next=37;break}return e.abrupt("return",null);case 37:return n(Object(i.f)({message:"Failed to fetch dashboard",error:e.t1})),console.error(e.t1),e.abrupt("return",null);case 40:case"end":return e.stop()}}),e,null,[[0,33]])})))).apply(this,arguments)}function v(e){return function(){var t=h(regeneratorRuntime.mark((function t(n,a){var c,d,h,m,b,g,v,w,O,E,k,C,P,j,x;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n(Object(i.g)()),setTimeout((function(){null===a().dashboard.getModel()&&n(Object(i.i)())}),500),t.next=4,y(e,n,a);case 4:if(c=t.sent){t.next=7;break}return t.abrupt("return");case 7:n(Object(i.h)()),t.prev=8,d=new l.a(c.dashboard,c.meta),t.next=17;break;case 12:return t.prev=12,t.t0=t.catch(8),n(Object(i.f)({message:"Failed create dashboard model",error:t.t0})),console.error(t.t0),t.abrupt("return");case 17:return(h=a()).location.query.orgId||n(Object(o.d)({query:{orgId:h.user.orgId},partial:!0,replace:!0})),m=e.$injector.get("timeSrv"),b=e.$injector.get("annotationsSrv"),g=e.$injector.get("keybindingSrv"),v=e.$injector.get("unsavedChangesSrv"),w=e.$injector.get("dashboardSrv"),m.init(d),b.init(d),h.dashboard.modifiedQueries&&(O=h.dashboard.modifiedQueries,E=O.panelId,k=O.queries,d.meta.fromExplore=!(!E||!k)),t.next=29,n(Object(u.c)(e.urlUid,d));case 29:if(a().templating.transaction.uid===e.urlUid){t.next=31;break}return t.abrupt("return");case 31:if(a().dashboard.initPhase===s.DashboardInitPhase.Services){t.next=33;break}return t.abrupt("return");case 33:try{d.processRepeats(),d.updateSubmenuVisibility(),(C=a().location.query).autofitpanels&&d.autoFitPanels(window.innerHeight,C.kiosk),v.init(d,e.$scope),g.setupDashboardBindings(e.$scope,d)}catch(e){n(Object(o.b)(Object(r.a)("Dashboard init failed",e))),console.error(e)}h.dashboard.modifiedQueries&&(P=h.dashboard.modifiedQueries,j=P.panelId,x=P.queries,S(n,d,j,x)),w.setCurrent(d),e.routeInfo!==s.DashboardRouteInfo.New?(Object(p.a)(d),f.a.watch(d.uid)):f.a.leave(),n(Object(i.e)(d));case 38:case"end":return t.stop()}}),t,null,[[8,12]])})));return function(e,n){return t.apply(this,arguments)}}()}function w(e){var t={meta:{canStar:!1,canShare:!1,isNew:!0,folderId:0},dashboard:{title:"New dashboard",panels:[{type:"add-panel",gridPos:{x:0,y:0,w:12,h:9},title:"Panel Title"}]}};return e&&(t.meta.folderId=parseInt(e,10)),t}function S(e,t,n,r){var a=t.panels.findIndex((function(e){return e.id===n}));a>-1&&(t.panels[a].targets=r),e(Object(i.d)())}},Cved:function(e,t,n){"use strict";var r;n.d(t,"a",(function(){return r})),function(e){e.Data="data",e.Meta="meta",e.Error="error",e.Stats="stats",e.JSON="json",e.Query="query"}(r||(r={}))},Yuww:function(e,t,n){"use strict";var r,a=n("q1tI"),o=n.n(a),i=n("TSYQ"),s=n.n(i),l=n("jYz7"),c=n("/MKj"),u=n("Obii"),p=n("t8hP"),f=n("kDLi"),d=n("Csm0"),h=n("NPB1"),m=n("Cved");function b(e){return(b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function g(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function v(e,t){return!t||"object"!==b(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function w(e){return(w=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function S(e,t){return(S=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}!function(e){e.Error="Error",e.Info="Info",e.Links="Links"}(r||(r={}));var O=function(e){function t(){var e,n;y(this,t);for(var a=arguments.length,i=new Array(a),s=0;s<a;s++)i[s]=arguments[s];return(n=v(this,(e=w(t)).call.apply(e,[this].concat(i)))).timeSrv=Object(h.a)(),n.getInfoMode=function(){var e=n.props,t=e.panel;return e.error?r.Error:t.description?r.Info:t.links&&t.links.length?r.Links:void 0},n.getInfoContent=function(){var e=n.props.panel,t=e.description||"",r=Object(p.getTemplateSrv)().replace(t,e.scopedVars),a=Object(u.renderMarkdown)(r),i=n.props.links&&n.props.links.getLinks(e);return o.a.createElement("div",{className:"panel-info-content markdown-html"},o.a.createElement("div",{dangerouslySetInnerHTML:{__html:a}}),i&&i.length>0&&o.a.createElement("ul",{className:"panel-info-corner-links"},i.map((function(e,t){return o.a.createElement("li",{key:t},o.a.createElement("a",{className:"panel-info-corner-links__item",href:e.href,target:e.target},e.title))}))))},n.onClickError=function(){Object(p.getLocationSrv)().update({partial:!0,query:{inspect:n.props.panel.id,inspectTab:m.a.Error}})},n}var n,a,i;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&S(e,t)}(t,e),n=t,(a=[{key:"renderCornerType",value:function(e,t,n){var a=e===r.Error?"error":"info";return o.a.createElement(f.Tooltip,{content:t,placement:"top-start",theme:a},o.a.createElement("div",{className:"panel-info-corner panel-info-corner--".concat(e.toLowerCase()),onClick:n},o.a.createElement("i",{className:"fa"}),o.a.createElement("span",{className:"panel-info-corner-inner"})))}},{key:"render",value:function(){var e=this.props.error,t=this.getInfoMode();return t?t===r.Error&&e?this.renderCornerType(t,e,this.onClickError):t===r.Info||t===r.Links?this.renderCornerType(t,this.getInfoContent):null:null}}])&&g(n.prototype,a),i&&g(n,i),t}(a.Component),E=n("kDDq");function k(){var e=P(["\n    position: absolute;\n    top: 7px;\n    right: ",";\n    color: ",";\n  "]);return k=function(){return e},e}function C(){var e=P(["\n    margin-right: ",";\n    a::after {\n      display: none;\n    }\n  "]);return C=function(){return e},e}function P(e,t){return t||(t=e.slice(0)),Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}function j(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,a=!1,o=void 0;try{for(var i,s=e[Symbol.iterator]();!(r=(i=s.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(e){a=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(a)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var x=function(e){var t=j(Object(a.useState)(null),2),n=t[0],r=t[1],i="submenu"===e.type,s="divider"===e.type,l=Object(f.useTheme)(),c=Object(E.css)(C(),l.spacing.sm),u=Object(E.css)(k(),l.spacing.xs,l.colors.textWeak);return s?o.a.createElement("li",{className:"divider"}):o.a.createElement("li",{className:i?"dropdown-submenu ".concat(I(n)):void 0,ref:r},o.a.createElement("a",{onClick:e.onClick,href:e.href},e.iconClassName&&o.a.createElement(f.Icon,{name:e.iconClassName,className:c}),o.a.createElement("span",{className:"dropdown-item-text","aria-label":d.selectors.components.Panels.Panel.headerItems(e.text)},e.text,i&&o.a.createElement(f.Icon,{name:"angle-right",className:u})),e.shortcut&&o.a.createElement("span",{className:"dropdown-menu-item-shortcut"},o.a.createElement(f.Icon,{name:"keyboard",className:c})," ",e.shortcut)),e.children)};function I(e){if(!e)return"invisible";var t=e.parentElement.getBoundingClientRect(),n=e.getBoundingClientRect();return 0===n.width?"invisible":t.right+n.width+10>window.innerWidth?"pull-left":"pull-right"}function D(e){return(D="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function T(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function N(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function R(e,t){return!t||"object"!==D(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function L(e){return(L=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _(e,t){return(_=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var M=function(e){function t(){var e,n;T(this,t);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=R(this,(e=L(t)).call.apply(e,[this].concat(a)))).renderItems=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return o.a.createElement("ul",{className:"dropdown-menu dropdown-menu--menu panel-menu",role:t?"":"menu"},e.map((function(e,t){return o.a.createElement(x,{key:"".concat(e.text).concat(t),type:e.type,text:e.text,iconClassName:e.iconClassName,onClick:e.onClick,shortcut:e.shortcut},e.subMenu&&n.renderItems(e.subMenu,!0))})))},n}var n,r,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_(e,t)}(t,e),n=t,(r=[{key:"render",value:function(){return o.a.createElement("div",{className:"panel-menu-container dropdown open"},this.renderItems(this.props.items))}}])&&N(n.prototype,r),a&&N(n,a),t}(a.PureComponent),V=n("MAcC"),U=n("3SGO"),q=n("iODs"),F=n("+JUD"),Q=n("umNM"),H=n("Efza"),z=n("m257"),A=n("ZFWI");function W(e,t,n){var r=function(e){Object(p.getLocationSrv)().update({partial:!0,query:{inspect:t.id,inspectTab:e}})},a=[];t.isEditing||a.push({text:"View",iconClassName:"eye",onClick:function(e){e.preventDefault(),q.d.dispatch(Object(U.d)({query:{viewPanel:t.id},partial:!0}))},shortcut:"v"}),e.canEditPanel(t)&&!t.isEditing&&a.push({text:"Edit",iconClassName:"edit",onClick:function(e){e.preventDefault(),q.d.dispatch(Object(U.d)({query:{editPanel:t.id},partial:!0}))},shortcut:"e"}),a.push({text:"Share",iconClassName:"share-alt",onClick:function(n){n.preventDefault(),Object(F.e)(e,t)},shortcut:"p s"}),!Q.a.hasAccessToExplore()||t.plugin&&t.plugin.meta.skipDataQuery||a.push({text:"Explore",iconClassName:"compass",shortcut:"x",onClick:function(e){e.preventDefault();var n=e.ctrlKey||e.metaKey?function(e){return window.open("".concat(A.b.appSubUrl).concat(e))}:void 0;q.d.dispatch(Object(H.l)(t,{getDataSourceSrv:p.getDataSourceSrv,getTimeSrv:h.a,getExploreUrl:z.j,openInNewWindow:n}))}});var o=[];t.plugin&&!t.plugin.meta.skipDataQuery&&(o.push({text:"Data",onClick:function(e){return r("data")}}),e.meta.canEdit&&o.push({text:"Query",onClick:function(e){return r("query")}})),o.push({text:"Panel JSON",onClick:function(e){return r("json")}}),a.push({type:"submenu",text:"Inspect",iconClassName:"info-circle",onClick:function(e){return r()},shortcut:"i",subMenu:o});var i=[];return!e.canEditPanel(t)||t.isViewing||t.isEditing||(i.push({text:"Duplicate",onClick:function(n){n.preventDefault(),Object(F.c)(e,t)},shortcut:"p d"}),i.push({text:"Copy",onClick:function(e){e.preventDefault(),Object(F.b)(t)}})),n&&function(){var e=n.getScope(),t=e.$$childHead.ctrl,r=t.getExtendedMenu(),a=!0,o=!1,s=void 0;try{for(var l,c=function(){var n=l.value,r={text:n.text,href:n.href,shortcut:n.shortcut};n.click&&(r.onClick=function(){e.$eval(n.click,{ctrl:t})}),i.push(r)},u=r[Symbol.iterator]();!(a=(l=u.next()).done);a=!0)c()}catch(e){o=!0,s=e}finally{try{a||null==u.return||u.return()}finally{if(o)throw s}}}(),!t.isEditing&&i.length&&a.push({type:"submenu",text:"More...",iconClassName:"cube",subMenu:i,onClick:function(e){e.preventDefault()}}),e.canEditPanel(t)&&!t.isEditing&&(a.push({type:"divider",text:""}),a.push({text:"Remove",iconClassName:"trash-alt",onClick:function(n){n.preventDefault(),Object(F.d)(e,t,!0)},shortcut:"p r"})),a}function B(e){return(B="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function $(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function J(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function K(e,t){return!t||"object"!==B(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function G(e){return(G=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function Z(e,t){return(Z=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var X=function(e){function t(){var e,n;$(this,t);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=K(this,(e=G(t)).call.apply(e,[this].concat(a)))).clickCoordinates={x:0,y:0},n.state={panelMenuOpen:!1,menuItems:[]},n.eventToClickCoordinates=function(e){return{x:Math.floor(e.clientX),y:Math.floor(e.clientY)}},n.onMouseDown=function(e){n.clickCoordinates=n.eventToClickCoordinates(e)},n.isClick=function(e){return e.x===n.clickCoordinates.x&&e.y===n.clickCoordinates.y},n.onMenuToggle=function(e){if(n.isClick(n.eventToClickCoordinates(e))){e.stopPropagation();var t=n.props,r=W(t.dashboard,t.panel,t.angularComponent);n.setState({panelMenuOpen:!n.state.panelMenuOpen,menuItems:r})}},n.closeMenu=function(){n.setState({panelMenuOpen:!1})},n.onCancelQuery=function(){n.props.panel.getQueryRunner().cancelQuery()},n.openInspect=function(e,t){var r=n.props,a=r.updateLocation,o=r.panel;e.stopPropagation(),a({query:{inspect:o.id,inspectTab:t},partial:!0})},n.renderNotice=function(e){var t="info-circle";return"error"!==e.severity&&"warning"!==e.severity||(t="exclamation-triangle"),o.a.createElement(f.Tooltip,{content:e.text,key:e.severity},e.inspect?o.a.createElement("div",{className:"panel-info-notice pointer",onClick:function(t){return n.openInspect(t,e.inspect)}},o.a.createElement(f.Icon,{name:t,style:{marginRight:"8px"}})):o.a.createElement("a",{className:"panel-info-notice",href:e.link,target:"_blank"},o.a.createElement(f.Icon,{name:t,style:{marginRight:"8px"}})))},n}var n,r,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Z(e,t)}(t,e),n=t,(r=[{key:"renderLoadingState",value:function(){return o.a.createElement("div",{className:"panel-loading",onClick:this.onCancelQuery},o.a.createElement(f.Tooltip,{content:"Cancel query"},o.a.createElement(f.Icon,{className:"panel-loading__spinner spin-clockwise",name:"sync"})))}},{key:"render",value:function(){var e=this.props,t=e.panel,n=e.scopedVars,r=e.error,a=e.isViewing,i=e.isEditing,l=e.data,c=e.alertState,h=this.state.menuItems,m=Object(p.getTemplateSrv)().replace(t.title,n,"text"),b=s()({"panel-header":!0,"grid-drag-handle":!(a||i)}),y={},g=!0,v=!1,w=void 0;try{for(var S,E=l.series[Symbol.iterator]();!(g=(S=E.next()).done);g=!0){var k=S.value;if(k.meta&&k.meta.notices){var C=!0,P=!1,j=void 0;try{for(var x,I=k.meta.notices[Symbol.iterator]();!(C=(x=I.next()).done);C=!0){var D=x.value;y[D.severity]=D}}catch(e){P=!0,j=e}finally{try{C||null==I.return||I.return()}finally{if(P)throw j}}}}}catch(e){v=!0,w=e}finally{try{g||null==E.return||E.return()}finally{if(v)throw w}}return o.a.createElement(o.a.Fragment,null,l.state===u.LoadingState.Loading&&this.renderLoadingState(),o.a.createElement("div",{className:b},o.a.createElement(O,{panel:t,title:t.title,description:t.description,scopedVars:t.scopedVars,links:Object(V.b)(t),error:r}),o.a.createElement("div",{className:"panel-title-container",onClick:this.onMenuToggle,onMouseDown:this.onMouseDown,"aria-label":d.selectors.components.Panels.Panel.title(m)},o.a.createElement("div",{className:"panel-title"},Object.values(y).map(this.renderNotice),c&&o.a.createElement(f.Icon,{name:"alerting"===c?"heart-break":"heart",className:"icon-gf panel-alert-icon",style:{marginRight:"4px"},size:"sm"}),o.a.createElement("span",{className:"panel-title-text"},m),o.a.createElement(f.Icon,{name:"angle-down",className:"panel-menu-toggle"}),this.state.panelMenuOpen&&o.a.createElement(f.ClickOutsideWrapper,{onClick:this.closeMenu,parent:document},o.a.createElement(M,{items:h})),l.request&&l.request.timeInfo&&o.a.createElement("span",{className:"panel-time-info"},o.a.createElement(f.Icon,{name:"clock-nine",size:"sm"})," ",l.request.timeInfo)))))}}])&&J(n.prototype,r),a&&J(n,a),t}(a.Component),Y=n("T9PE"),ee=n("eXZ6"),te=n("WnbS"),ne=n("kHZm");function re(e,t){var n=Object(ne.a)(e.snapshotData);return{timeRange:u.DefaultTimeRange,state:u.LoadingState.Done,series:Object(u.applyFieldOverrides)({data:n,fieldConfig:{defaults:{},overrides:[]},autoMinMax:!0,replaceVariables:e.replaceVariables,getDataSourceSettingsByUid:Object(te.a)().getDataSourceSettingsByUid.bind(Object(te.a)()),fieldConfigRegistry:e.plugin.fieldConfigRegistry,theme:A.a.theme,timeZone:t.getTimezone()})}}function ae(e){return(ae="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function oe(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function ie(e,t){return!t||"object"!==ae(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function se(e){return(se=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function le(e,t){return(le=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var ce=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=ie(this,se(t).call(this,e))).timeSrv=Object(h.a)(),n.onRefresh=function(){var e=n.props,t=e.panel,r=e.isInView,a=e.width;if(r){var o=Object(F.a)(t,n.timeSrv.timeRange());if(n.wantsQueryExecution){if(a<0)return;t.getQueryRunner().run({datasource:t.datasource,queries:t.targets,panelId:t.id,dashboardId:n.props.dashboard.id,timezone:n.props.dashboard.getTimezone(),timeRange:o.timeRange,timeInfo:o.timeInfo,maxDataPoints:t.maxDataPoints||a,minInterval:t.interval,scopedVars:t.scopedVars,cacheTimeout:t.cacheTimeout,transformations:t.transformations})}else n.onRender()}else n.setState({refreshWhenInView:!0})},n.onRender=function(){var e={renderCounter:n.state.renderCounter+1};n.setState(e)},n.onOptionsChange=function(e){n.props.panel.updateOptions(e)},n.onFieldConfigChange=function(e){n.props.panel.updateFieldConfig(e)},n.onPanelError=function(e){n.state.errorMessage!==e&&n.setState({errorMessage:e})},n.onChangeTimeRange=function(e){n.timeSrv.setTime({from:Object(u.toUtc)(e.from),to:Object(u.toUtc)(e.to)})},n.state={isFirstLoad:!0,renderCounter:0,refreshWhenInView:!1,data:{state:u.LoadingState.NotStarted,series:[],timeRange:u.DefaultTimeRange}},n}var n,r,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&le(e,t)}(t,e),n=t,(r=[{key:"componentDidMount",value:function(){var e=this,t=this.props,n=t.panel,r=t.dashboard;n.events.on(u.PanelEvents.refresh,this.onRefresh),n.events.on(u.PanelEvents.render,this.onRender),r.panelInitialized(this.props.panel),this.hasPanelSnapshot?this.setState({data:re(n,r),isFirstLoad:!1}):(this.wantsQueryExecution||this.setState({isFirstLoad:!1}),this.querySubscription=n.getQueryRunner().getData({withTransforms:!0,withFieldConfig:!0}).subscribe({next:function(t){return e.onDataUpdate(t)}}))}},{key:"componentWillUnmount",value:function(){this.props.panel.events.off(u.PanelEvents.refresh,this.onRefresh),this.props.panel.events.off(u.PanelEvents.render,this.onRender),this.querySubscription&&this.querySubscription.unsubscribe()}},{key:"componentDidUpdate",value:function(e){var t=this.props.isInView;t!==e.isInView&&t&&this.state.refreshWhenInView&&this.onRefresh()}},{key:"onDataUpdate",value:function(e){if(this.props.isInView){var t,n=this.state.isFirstLoad;switch(e.state){case u.LoadingState.Loading:if(this.state.data.state===u.LoadingState.Loading)return;break;case u.LoadingState.Error:var r=e.error;r&&t!==r.message&&(t=r.message);break;case u.LoadingState.Done:this.props.dashboard.snapshot&&(this.props.panel.snapshotData=e.series.map((function(e){return Object(u.toDataFrameDTO)(e)}))),n&&(n=!1)}this.setState({isFirstLoad:n,errorMessage:t,data:e})}}},{key:"shouldSignalRenderingCompleted",value:function(e,t){return e===u.LoadingState.Done||t.skipDataQuery}},{key:"renderPanel",value:function(e,t){var n=this.props,r=n.panel,a=n.plugin,i=this.state,l=i.renderCounter,c=i.data,p=i.isFirstLoad,f=A.b.theme,d=c.state;if(p&&(d===u.LoadingState.Loading||d===u.LoadingState.NotStarted))return null;this.shouldSignalRenderingCompleted(d,a.meta)&&Y.a.renderingCompleted();var h=a.panel,m=c.timeRange||this.timeSrv.timeRange(),b=this.hasOverlayHeader()?0:f.panelHeaderHeight,y=a.noPadding?0:f.panelPadding,g=e-2*y-ee.i,v=t-b-2*y-ee.i,w=s()({"panel-content":!0,"panel-content--no-padding":a.noPadding}),S=r.getOptions();return o.a.createElement(o.a.Fragment,null,o.a.createElement("div",{className:w},o.a.createElement(h,{id:r.id,data:c,title:r.title,timeRange:m,timeZone:this.props.dashboard.getTimezone(),options:S,fieldConfig:r.fieldConfig,transparent:r.transparent,width:g,height:v,renderCounter:l,replaceVariables:r.replaceVariables,onOptionsChange:this.onOptionsChange,onFieldConfigChange:this.onFieldConfigChange,onChangeTimeRange:this.onChangeTimeRange})))}},{key:"hasOverlayHeader",value:function(){var e=this.props.panel,t=this.state,n=t.errorMessage,r=t.data;return!(n||r.request&&r.request.timeInfo||e.hasTitle())}},{key:"render",value:function(){var e=this,t=this.props,n=t.dashboard,r=t.panel,a=t.isViewing,i=t.isEditing,l=t.width,c=t.height,u=t.updateLocation,p=this.state,h=p.errorMessage,m=p.data,b=r.transparent,y=s()({"panel-container":!0,"panel-container--absolute":!0,"panel-container--transparent":b,"panel-container--no-title":this.hasOverlayHeader()});return o.a.createElement("div",{className:y,"aria-label":d.selectors.components.Panels.Panel.containerByTitle(r.title)},o.a.createElement(X,{panel:r,dashboard:n,title:r.title,description:r.description,scopedVars:r.scopedVars,links:r.links,error:h,isEditing:i,isViewing:a,data:m,updateLocation:u}),o.a.createElement(f.ErrorBoundary,null,(function(t){var n=t.error;return n?(e.onPanelError(n.message||"Error in plugin"),null):e.renderPanel(l,c)})))}},{key:"hasPanelSnapshot",get:function(){var e=this.props.panel;return e.snapshotData&&e.snapshotData.length}},{key:"wantsQueryExecution",get:function(){return!(this.props.plugin.meta.skipDataQuery||this.hasPanelSnapshot)}}])&&oe(n.prototype,r),a&&oe(n,a),t}(a.PureComponent),ue=n("KyLG");function pe(e){return(pe="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function fe(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function de(e,t){return!t||"object"!==pe(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function he(e){return(he=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function me(e,t){return(me=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var be=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=de(this,he(t).call(this,e))).element=null,n.timeSrv=Object(h.a)(),n.onPanelRenderEvent=function(e){var t=n.state.alertState;e&&e.alertState&&n.props.panel.alert?n.setState({alertState:e.alertState}):e&&e.alertState&&!n.props.panel.alert?n.setState({alertState:void 0}):e&&t?n.setState({alertState:void 0}):n.forceUpdate()},n.state={data:{state:u.LoadingState.NotStarted,series:[],timeRange:u.DefaultTimeRange}},n}var n,r,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&me(e,t)}(t,e),n=t,(r=[{key:"componentDidMount",value:function(){var e=this,t=this.props.panel;this.loadAngularPanel();var n=t.getQueryRunner();this.querySubscription=n.getData({withTransforms:!1,withFieldConfig:!1}).subscribe({next:function(t){return e.onPanelDataUpdate(t)}})}},{key:"subscribeToRenderEvent",value:function(){this.props.panel.events.on(u.PanelEvents.render,this.onPanelRenderEvent)}},{key:"onPanelDataUpdate",value:function(e){var t;if(e.state===u.LoadingState.Error){var n=e.error;n&&t!==n.message&&(t=n.message)}this.setState({data:e,errorMessage:t})}},{key:"componentWillUnmount",value:function(){this.cleanUpAngularPanel(),this.querySubscription&&this.querySubscription.unsubscribe(),this.props.panel.events.off(u.PanelEvents.render,this.onPanelRenderEvent)}},{key:"componentDidUpdate",value:function(e,t){var n=this.props,r=n.plugin,a=n.height,o=n.width,i=n.panel;e.plugin!==r&&(this.cleanUpAngularPanel(),this.loadAngularPanel()),e.width===o&&e.height===a||this.scopeProps&&(this.scopeProps.size.height=this.getInnerPanelHeight(),this.scopeProps.size.width=this.getInnerPanelWidth(),i.events.emit(u.PanelEvents.panelSizeChanged))}},{key:"getInnerPanelHeight",value:function(){var e=this.props,t=e.plugin,n=e.height,r=A.b.theme;return n-(this.hasOverlayHeader()?0:r.panelHeaderHeight)-2*(t.noPadding?0:r.panelPadding)-ee.i}},{key:"getInnerPanelWidth",value:function(){var e=this.props,t=e.plugin,n=e.width,r=A.b.theme;return n-2*(t.noPadding?0:r.panelPadding)-ee.i}},{key:"loadAngularPanel",value:function(){var e=this.props,t=e.panel,n=e.dashboard,r=e.setPanelAngularComponent;if(this.element){var a=Object(p.getAngularLoader)();this.scopeProps={panel:t,dashboard:n,size:{width:this.getInnerPanelWidth(),height:this.getInnerPanelHeight()}},r({panelId:t.id,angularComponent:a.load(this.element,this.scopeProps,'<plugin-component type="panel" class="panel-height-helper"></plugin-component>')}),this.subscribeToRenderEvent()}}},{key:"cleanUpAngularPanel",value:function(){var e=this.props,t=e.angularComponent,n=e.setPanelAngularComponent,r=e.panel;t&&t.destroy(),n({panelId:r.id,angularComponent:null})}},{key:"hasOverlayHeader",value:function(){var e=this.props.panel,t=this.state,n=t.errorMessage,r=t.data;return!(n||r.request&&r.request.timeInfo||e.hasTitle())}},{key:"render",value:function(){var e,t,n,r=this,a=this.props,i=a.dashboard,l=a.panel,c=a.isViewing,u=a.isEditing,p=a.plugin,f=a.angularComponent,h=a.updateLocation,m=this.state,b=m.errorMessage,y=m.data,g=m.alertState,v=l.transparent,w=s()((e={"panel-container":!0,"panel-container--absolute":!0,"panel-container--transparent":v,"panel-container--no-title":this.hasOverlayHeader(),"panel-has-alert":void 0!==l.alert},t="panel-alert-state--".concat(g),n=void 0!==g,t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e)),S=s()({"panel-content":!0,"panel-content--no-padding":p.noPadding});return o.a.createElement("div",{className:w,"aria-label":d.selectors.components.Panels.Panel.containerByTitle(l.title)},o.a.createElement(X,{panel:l,dashboard:i,title:l.title,description:l.description,scopedVars:l.scopedVars,angularComponent:f,links:l.links,error:b,isViewing:c,isEditing:u,data:y,updateLocation:h,alertState:g}),o.a.createElement("div",{className:S},o.a.createElement("div",{ref:function(e){return r.element=e},className:"panel-height-helper"})))}}])&&fe(n.prototype,r),a&&fe(n,a),t}(a.PureComponent),ye={setPanelAngularComponent:ue.n,updateLocation:U.d},ge=Object(c.connect)((function(e,t){return{angularComponent:e.dashboard.panels[t.panel.id].angularComponent}}),ye)(be),ve=n("J4KJ"),we=n("13X4");function Se(e){return(Se="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function Oe(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function Ee(e,t){return!t||"object"!==Se(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function ke(e){return(ke=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function Ce(e,t){return(Ce=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}n.d(t,"a",(function(){return xe}));var Pe=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=Ee(this,ke(t).call(this,e))).specialPanels={},n.onMouseEnter=function(){n.props.dashboard.setPanelFocus(n.props.panel.id)},n.onMouseLeave=function(){n.props.dashboard.setPanelFocus(0)},n.state={isLazy:!e.isInView},n}var n,r,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Ce(e,t)}(t,e),n=t,(r=[{key:"componentDidMount",value:function(){this.props.initDashboardPanel(this.props.panel)}},{key:"componentDidUpdate",value:function(){this.state.isLazy&&this.props.isInView&&this.setState({isLazy:!1})}},{key:"renderPanel",value:function(e){var t=this.props,n=t.dashboard,r=t.panel,a=t.isViewing,i=t.isInView,s=t.isEditing,c=t.updateLocation;return o.a.createElement(l.a,null,(function(t){var l=t.width,u=t.height;return 0===l?null:e.angularPanelCtrl?o.a.createElement(ge,{plugin:e,panel:r,dashboard:n,isViewing:a,isEditing:s,isInView:i,width:l,height:u}):o.a.createElement(ce,{plugin:e,panel:r,dashboard:n,isViewing:a,isEditing:s,isInView:i,width:l,height:u,updateLocation:c})}))}},{key:"render",value:function(){var e=this.props,t=e.isViewing,n=e.plugin,r=this.state.isLazy;if(!n)return null;if(r)return null;var a=s()({"panel-wrapper":!0,"panel-wrapper--view":t});return o.a.createElement("div",{className:a,onMouseEnter:this.onMouseEnter,onMouseLeave:this.onMouseLeave},this.renderPanel(n))}}])&&Oe(n.prototype,r),a&&Oe(n,a),t}(a.PureComponent),je={initDashboardPanel:ve.f,updateLocation:we.b},xe=Object(c.connect)((function(e,t){var n=e.dashboard.panels[t.panel.id];return n?{plugin:n.plugin}:{plugin:null}}),je)(Pe)}}]);
//# sourceMappingURL=default~DashboardPage~SoloPanelPage.8fac2dc1d47d6c3fc6b7.js.map
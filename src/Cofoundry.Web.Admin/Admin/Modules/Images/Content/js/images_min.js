/*! Cofoundry 2020-12-16 */
angular.module("cms.images",["ngRoute","cms.shared"]).constant("_",window._).constant("images.modulePath","/Admin/Modules/Images/Js/"),angular.module("cms.images").config(["$routeProvider","shared.routingUtilities","images.modulePath",function(a,b,c){b.registerCrudRoutes(a,c,"Image")}]),angular.module("cms.images").factory("images.imageService",["$http","shared.imageService",function(a,b){var c=_.extend({},b);return c.remove=function(b){return a["delete"](c.getIdRoute(b))},c}]),angular.module("cms.images").controller("AddImageController",["$location","_","shared.focusService","shared.stringUtilities","shared.LoadState","images.imageService",function(a,b,c,d,e,f){function g(){j(),m.save=h,m.cancel=k,m.onFileChanged=i,m.editMode=!1,m.saveLoadState=new e}function h(){m.saveLoadState.on(),f.add(m.command).progress(m.saveLoadState.setProgress).then(l)}function i(){var a=m.command;a.file&&a.file.name&&(a.title=d.capitaliseFirstLetter(d.getFileNameWithoutExtension(a.file.name)),c.focusById("title"))}function j(){m.command={}}function k(){l()}function l(){a.path("")}var m=this;g()}]),angular.module("cms.images").controller("ImageDetailsController",["$routeParams","$q","$location","_","shared.LoadState","shared.modalDialogService","shared.permissionValidationService","shared.urlLibrary","images.imageService","images.modulePath",function(a,b,c,d,e,f,g,h,i,j){function k(){v.edit=l,v.save=m,v.cancel=n,v.remove=o,v.editMode=!1,v.globalLoadState=new e,v.saveLoadState=new e,v.formLoadState=new e(!0),v.canDelete=g.canDelete("COFIMG"),v.canUpdate=g.canUpdate("COFIMG"),q(v.formLoadState)}function l(){v.editMode=!0,v.mainForm.formStatus.clear()}function m(){t(v.saveLoadState),i.update(v.command).progress(v.saveLoadState.setProgress).then(p.bind(null,"Changes were saved successfully",v.saveLoadState))}function n(){v.editMode=!1,v.previewImage=d.clone(v.image),v.command=r(v.image),v.previewUrl=h.getImageUrl(v.previewImage),v.mainForm.formStatus.clear()}function o(){function a(){return t(),i.remove(v.image.imageAssetId).then(s)["catch"](u)}var b={title:"Delete Image",message:"Are you sure you want to delete this image?",okButtonTitle:"Yes, delete it",onOk:a};f.confirm(b)}function p(a,b){return q(b).then(v.mainForm.formStatus.success.bind(null,a))}function q(b){function c(){return i.getById(a.id).then(function(a){v.image=a,v.previewImage=a,v.command=r(a),v.previewUrl=h.getImageUrl(v.previewImage),v.editMode=!1})}return c().then(u.bind(null,b))}function r(a){return d.pick(a,"imageAssetId","title","tags","defaultAnchorLocation")}function s(){c.path("")}function t(a){v.globalLoadState.on(),a&&d.isFunction(a.on)&&a.on()}function u(a){v.globalLoadState.off(),a&&d.isFunction(a.off)&&a.off()}var v=this;k()}]),angular.module("cms.images").controller("ImageListController",["_","shared.LoadState","shared.SearchQuery","shared.permissionValidationService","images.imageService",function(a,b,c,d,e){function f(){j.gridLoadState=new b,j.query=new c({onChanged:h}),j.filter=j.query.getFilters(),j.toggleFilter=g,j.canCreate=d.canCreate("COFIMG"),j.canUpdate=d.canUpdate("COFIMG"),g(!1),i()}function g(b){j.isFilterVisible=a.isUndefined(b)?!j.isFilterVisible:b}function h(){g(!1),i()}function i(){return j.gridLoadState.on(),e.getAll(j.query.getParameters()).then(function(a){j.result=a,j.gridLoadState.off()})}var j=this;f()}]);
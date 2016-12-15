﻿// Internals
Cofoundry.siteViewer = (function () {

    /*
    !!!IMPORTANT!!!
    THIS FILE WILL BE INJECTED INTO THE SITE TEMPLATES,
    THEREFORE THIS FILE SHOULD CONTAIN NO THIRD PARTY DEPENDENCIES
    TO MINIMIZE ANY RISKS OF CONFLICTS

    ALL ADMIN UNPUTS ARE PROXIED VIA AN IFRAME TO ENSURE THE ANGULAR WORLD IS
    CONTAINED AWAY FROM THE SITE TEMPLATES
    
    */

    // Private variables
    var __IFRAME,
        __TOOLBAR,
        __TOOLBAR_BUTTONS,
        __TOOLBAR_SECTION,
        __TOOLBAR_MODULE
        ;

    var _internal = {
        bindIframe: function () {
            // Create dom elements
            var iFrame = document.getElementById('cofoundry-src__iFrame'),
                body = document.getElementsByTagName('body')[0];

            // Store ref to iFrame
            __IFRAME = iFrame;

            // Fire config inside the frame
            __IFRAME.contentWindow.postMessage({
                action: 'config', args: [false, 'EntityNameSingular']
            }, document.location.origin);

            // Create IE + others compatible event handler
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
                postMessageListener = window[eventMethod],
                messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

            // Listen to events from inside the iFrame
            postMessageListener(messageEvent, handleMessage);

            // Handle events received from the iFrame
            function handleMessage (e) {
                switch (e.data.type) {
                    case 'MODAL_CLOSE':
                        __IFRAME.style.display = 'none';
                        break;
                }
            }
        },

        bindToolbar: function () {
            var toolbar = document.getElementById('cofoundry-sv'),
                siteViewerMode = _internal.model.siteViewerMode
                ;

            // Internal refs
            __TOOLBAR = toolbar;

            if (siteViewerMode === 'Draft' || siteViewerMode === 'Edit') {
                // Insert publish button
                _toolBar.addButton({
                    icon: 'fa-cloud-upload',
                    title: 'Publish',
                    type: 'primary',
                    classNames: 'publish popup',
                    click: _internal.publish
                });
            } else if (siteViewerMode === 'Live') {
                // Insert unpublish button
                _toolBar.addButton({
                    icon: 'fa-cloud-download',
                    title: 'Unpublish',
                    type: 'primary',
                    classNames: 'publish popup',
                    click: _internal.unpublish
                });
            } else if (siteViewerMode === 'SpecificVersion') {
                // Insert copy to draft button
                _toolBar.addButton({
                    icon: 'fa-files-o',
                    title: 'Copy to<br />draft',
                    type: 'primary',
                    classNames: 'publish popup',
                    click: _internal.copyToDraft
                });
            }
        },

        bindGui() {
            var toolbar_section = document.getElementById('cofoundry-sv__section-popover-container'),
                toolbar_module = document.getElementById('cofoundry-sv__module-popover-container'),
                scope = {
                    buttons: {}
                }
                ;

            // Internal refs
            __TOOLBAR_SECTION = toolbar_section;
            __TOOLBAR_MODULE = toolbar_module;

            // Add class to doc. Used for admin UI 
            document.getElementsByTagName('html')[0]
                .className = (_internal.model.isCustomEntityRoute ? 'cofoundry-editmode__custom-entity' : 'cofoundry-editmode__page');

            if (_internal.model.siteViewerMode === 'Edit') {
                // Bind events
                addMouseEvents(document);
                addButtonEvents();
                addDocumentEvents();
            }

            function addMouseEvents(rootElement, popover) {
                var entityType = _internal.model.isCustomEntityRoute ? 'custom-entity' : 'page';
                addEventsForComponent('section', onSectionMouseEnter, onSectionMouseLeave);
                addEventsForComponent('section-module', onModuleMouseEnter, onModuleMouseLeave);

                function addEventsForComponent(componentName, onMouseEnterFn, onMouseLeaveFn) {
                    var selectorAttribute = 'data-cms-' + entityType + '-' + componentName,
                        elements, len, i;

                    if (rootElement.hasAttribute && rootElement.hasAttribute(selectorAttribute)) {
                        // we are passing the element directly to bind events
                        elements = [rootElement];
                    } else {
                        // we need to query the children to find elements to bind events to
                        elements = rootElement.querySelectorAll('[' + selectorAttribute + ']');
                    }

                    len = elements.length;
                    for (i = 0; i < len; ++i) {
                        elements[i].addEventListener('mouseenter', onMouseEnterFn);
                        elements[i].addEventListener('mouseleave', onMouseLeaveFn);
                    }
                }
            }

            function addButtonEvents() {
                // Buttons
                var addSectionModuleButton = __TOOLBAR_SECTION.querySelectorAll('#cofoundry-sv__btn-add-section-module')[0],
                    moveupModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-moveup')[0],
                    movedownModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-movedown')[0],
                    editModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-edit')[0],
                    addModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-add')[0],
                    deleteModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-delete')[0],
                    addaboveModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-addabove')[0],
                    addbelowModuleButton = __TOOLBAR_MODULE.querySelectorAll('#cofoundry-sv__btn-module-addbelow')[0];

                // Bind click events
                bindEventHandler(addSectionModuleButton, 'addSectionModule', onAddSectionModule);
                bindEventHandler(moveupModuleButton, 'moveModuleUp', onMoveupModule);
                bindEventHandler(movedownModuleButton, 'moveModuleDown', onMovedownModule);
                bindEventHandler(editModuleButton, 'editModule', onEditModule);
                bindEventHandler(addModuleButton, 'addModule', onAddModule);
                bindEventHandler(addaboveModuleButton, 'addModuleAbove', onAddaboveModule);
                bindEventHandler(addbelowModuleButton, 'addModuleBelow', onAddbelowModule);
                bindEventHandler(deleteModuleButton, 'deleteModule', onDeleteModule);

                // Handlers
                function onAddSectionModule() {
                    handler('addSectionModule', {
                        pageTemplateSectionId: scope.pageTemplateSectionId,
                        permittedModuleTypes: scope.permittedModuleTypes,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                function onMoveupModule() {
                    handler('moveModuleUp', {
                        versionModuleId: scope.versionModuleId,
                        isCustomEntity: _internal.model.isCustomEntityRoute,
                        isUp: true
                    });
                }

                function onMovedownModule() {
                    handler('moveModuleDown', {
                        versionModuleId: scope.versionModuleId,
                        isCustomEntity: _internal.model.isCustomEntityRoute,
                        isUp: false
                    });
                }

                function onEditModule() {
                    handler('editModule', {
                        versionModuleId: scope.versionModuleId,
                        pageModuleTypeId: scope.pageModuleTypeId,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                function onAddModule() {
                    handler('addModule', {
                        insertMode: 'Last',
                        pageTemplateSectionId: scope.pageTemplateSectionId,
                        permittedModuleTypes: scope.permittedModuleTypes,
                        versionModuleId: scope.versionModuleId,
                        pageModuleTypeId: scope.pageModuleTypeId,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                function onAddaboveModule() {
                    handler('addModuleAbove', {
                        insertMode: 'BeforeItem',
                        pageTemplateSectionId: scope.pageTemplateSectionId,
                        permittedModuleTypes: scope.permittedModuleTypes,
                        versionModuleId: scope.versionModuleId,
                        pageModuleTypeId: scope.pageModuleTypeId,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                function onAddbelowModule() {
                    handler('addModuleBelow', {
                        insertMode: 'AfterItem',
                        pageTemplateSectionId: scope.pageTemplateSectionId,
                        permittedModuleTypes: scope.permittedModuleTypes,
                        versionModuleId: scope.versionModuleId,
                        pageModuleTypeId: scope.pageModuleTypeId,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                function onDeleteModule() {
                    handler('deleteModule', {
                        versionModuleId: scope.versionModuleId,
                        isCustomEntity: _internal.model.isCustomEntityRoute
                    });
                }

                // Helper
                function bindEventHandler(button, action, handler) {
                    scope.buttons[action] = button;
                    button.addEventListener('click', handler);
                }

                function handler(action, args) {
                    scope.buttons[action]
                    __IFRAME.contentWindow.postMessage({
                        action: action, args: [args]
                    }, document.location.origin);
                    __IFRAME.style.display = 'block';
                }
            }

            function addDocumentEvents() {
                document.addEventListener('resize', onResize);
                document.addEventListener('scroll', onScroll);

                function onResize(e) {
                    onSectionGuiChange();
                }
                
                function onScroll(e) {
                    onSectionGuiChange();
                }
            }

            function onSectionMouseEnter(e) {
                onSectionGuiChange(e.target);
            }

            function onSectionMouseLeave() {
                //onGuiEnd();
            }

            function onModuleMouseEnter(e) {
                onModuleGuiChange(e.target);
            }

            function onModuleMouseLeave() {
                //onGuiEnd();
            }

            function onSectionGuiChange(el) {
                if (el) {
                    scope.currentElement = el;
                    scope.pageTemplateSectionId = el.getAttribute('data-cms-page-template-section-id');
                    scope.permittedModuleTypes = parseModuleTypes(el.getAttribute('data-cms-page-section-permitted-module-types'));
                    scope.sectionName = el.getAttribute('data-cms-page-section-name');
                    scope.isMultiModule = el.getAttribute('data-cms-multi-module');
                    scope.isCustomEntity = el.hasAttribute('data-cms-custom-entity-section');

                    var sectionName = __TOOLBAR_SECTION.querySelectorAll('#cofoundry-sv__section-name')[0];
                    if (sectionName) {
                        sectionName.innerHTML = scope.sectionName;
                    }

                    showHideButton('addSectionModule', scope.isMultiModule);
                }

                setPosition();

                function parseModuleTypes(moduleTypeValue) {
                    if (!moduleTypeValue) return [];

                    return moduleTypeValue.split(',');
                }
                
                function setPosition() {
                    var elementOffset = offset(scope.currentElement),
                        top = elementOffset.top,
                        left = elementOffset.left + scope.currentElement.offsetWidth;

                    scope.css = {
                        top: top + 'px',
                        left: (left || 0) + 'px'
                    };

                    scope.startScrollY = scope.currentScrollY;
                    scope.startY = top;

                    __TOOLBAR_SECTION.style.display = 'block';
                    __TOOLBAR_SECTION.style.top = scope.css.top;
                    __TOOLBAR_SECTION.style.left = scope.css.left;
                }
            }

            function onModuleGuiChange(el) {
                var css = {};

                if (el) {
                    scope.versionModuleId = el.getAttribute('data-cms-version-module-id');
                    scope.pageModuleTypeId = el.getAttribute('data-cms-page-module-type-id');

                    showHideButton('addModule', !scope.versionModuleId);
                    showHideButton('editModule', scope.versionModuleId);
                    showHideButton('deleteModule', scope.versionModuleId);
                    showHideButton('moveModuleUp', scope.isMultiModule);
                    showHideButton('moveModuleDown', scope.isMultiModule);
                    showHideButton('addModuleAbove', scope.isMultiModule);
                    showHideButton('addModuleBelow', scope.isMultiModule);
                }

                setPosition();

                function setPosition() {
                    var elementOffset = offset(el),
                        top = elementOffset.top,
                        left = elementOffset.left + 2;

                    css = {
                        top: top + 'px',
                        left: (left || 0) + 'px'
                    };

                    scope.startScroll = scope.currentScrollY;
                    scope.startY = top;

                    __TOOLBAR_MODULE.style.display = 'block';
                    __TOOLBAR_MODULE.style.top = css.top;
                    __TOOLBAR_MODULE.style.left = css.left;
                }
            }

            function onGuiEnd() {
                scope.guiTimeout = setTimeout(function () {
                    __TOOLBAR_SECTION.style.display =
                    __TOOLBAR_MODULE.style.display = 'none';
                }, 300);
            }

            function showHideButton(action, condition) {
                scope.buttons[action].style.display = condition ? 'block' : 'none';
            }

            function offset(el) {
                var rect = el.getBoundingClientRect();
                return {
                    top: rect.top + document.body.scrollTop,
                    left: rect.left + document.body.scrollLeft
                }
            }

            function onResize(e) {
                scope.isOver = false;
                scope.sectionAnchorElement = '';
            }

            function onScroll(e) {
                scope.currentScrollY = (e || 0);
                var y = scope.startY + (scope.startScrollY - e);
                if (y < 0) y = 0;
                if (y) {
                    scope.css = {
                        top: y + 'px',
                        left: scope.css.left
                    }
                }
            }
        },

        // Actions
        publish: function (e) {
            e.preventDefault();
            __IFRAME.contentWindow.postMessage({
                action: 'publish', args: [{ entityId: 1 }]
            }, document.location.origin);
            __IFRAME.style.display = 'block';
        },

        unpublish: function (e) {
            e.preventDefault();
            __IFRAME.contentWindow.postMessage({
                action: 'unpublish', args: [{ entityId: 1 }]
            }, document.location.origin);
        },

        copyToDraft: function (e) {
            e.preventDefault();
            __IFRAME.contentWindow.postMessage({
                action: 'copyToDraft', args: [{
                    entityId: 1,
                    versionId: 1,
                    hasDraftVersion: false
                }]
            }, document.location.origin);
        }
    }

    var _toolBar = {
        addButton: function (options) {
            var type = options.type || 'secondary',
                btn = document.createElement('a');

            btn.className = (type === 'primary' ? 'cofoundry-sv__options__button' : 'cofoundry-sv__mode__button') + ' ' + options.classNames;
            btn.innerHTML = options.title;

            if (options.click) {
                btn.href = '#';
                btn.addEventListener('click', options.click, false);
            } else {
                btn.href = options.href || '#';
            }

            if (options.icon) {
                var icon = document.createElement('span');
                icon.className = 'fa ' + options.icon;
                btn.insertBefore(icon, btn.firstChild);
            }

            __TOOLBAR_BUTTONS = __TOOLBAR.getElementsByClassName(type === 'primary' ? 'cofoundry-sv__options' : 'cofoundry-sv__mode')[0];
            if (__TOOLBAR_BUTTONS) {
                __TOOLBAR_BUTTONS.appendChild(btn);
            }
        }
    }

    window.onload = function () {
        // pageResponseData object is a serialized object inserted into the page
        _internal.model = pageResponseData;
        _internal.bindIframe();
        _internal.bindGui();
        _internal.bindToolbar();
    }

    // Return public API
    return {
        toolBar: _toolBar
    }

})();
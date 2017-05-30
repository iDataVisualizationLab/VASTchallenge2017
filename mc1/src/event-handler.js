var EventHandler = function EventHandler () {
    this.myEvents = {};
};

EventHandler.prototype.addEvent = function addEvent (name, handlers, context) {
    if (!this.myEvents.hasOwnProperty(name)) {
        this.myEvents[name] = [];
    }

    let existingHandlers = this.myEvents[name];

    if (!Array.isArray(handlers)) {
        existingHandlers.push({context: context, handler: handlers})
    }
    else {

        handlers.forEach(function (handler) {
            existingHandlers.push({context: context, handler: handler});
        });
    }
};

EventHandler.prototype.fireEvent = function fireEvent (e) {
    let handlers = this.myEvents[e.name];
    if (!!handlers) {
        handlers.forEach (function (handlerContext) {

            let ctx = handlerContext.context;
            let fun = handlerContext.handler;

            fun.apply(ctx, [e]);
        });
    }
};

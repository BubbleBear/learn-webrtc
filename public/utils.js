export function eventInspector(target, eventName) {
    target.addEventListener(eventName, () => {
        console.log(eventName);
    });
}

export function inspectMediaElementEvents(element) {
    const inspect = eventInspector.bind(element, element);

    inspect('abort');
    inspect('canplaythrough');
    inspect('error');
    inspect('loadeddata');
    inspect('loadstart');
    inspect('play');
    inspect('playing');
    // inspect('progress');
    // inspect('timeupdate');
    inspect('volumechange');
    inspect('waiting');
}

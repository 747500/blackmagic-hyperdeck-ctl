
# after connect

```
500 connection info:
protocol version: 1.1
model: HyperDeck Studio
```

# help

```
help
```

```
201 help:

Blackmagic HyperDeck Ethernet Protocol 1.1
------------------------------------------

Available commands:

    help                                   return this help
    commands                               return commands in XML format
    device info                            return device information
    quit                                   disconnect ethernet control
    ping                                   check device is responding
    preview: enable: {true/false}          switch to preview or output
    play                                   play from current timecode
    play: speed: {-1600 to 1600}           play at specific speed
    play: loop: {true/false}               play in loops or stop-at-end
    play: single clip: {true/false}        play current clip or all clips
    record                                 record from current input
    record: name: {name}                   record named clip
    stop                                   stop playback or recording
    clips get                              query all clips
    transport info                         query current activity
    slot info                              query active slot
    slot info: slot id: {n}                query slot {n}
    slot select: slot id: {1/2}            switch to specified slot
    slot select: video format: {format}    load clips of specified format
    notify                                 query notification status
    notify: remote: {true/false}           set remote notifications
    notify: transport: {true/false}        set transport notifications
    notify: slot: {true/false}             set slot notifications
    notify: configuration: {true/false}    set configuration notifications
    goto: clip id: {n}                     goto clip id {n}
    goto: clip: {start/end}                goto start or end of clip
    goto: timeline: {start/end}            goto start or end of timeline
    goto: timecode: {timecode}             goto specified timecode
    goto: timecode: +{timecode}            go forward {timecode} duration
    goto: timecode: -{timecode}            go backward {timecode} duration
    remote                                 query unit remote control state
    remote: enable: {true/false}           enable or disable remote control
    remote: override: {true/false}         session override remote control
    configuration                          query configuration settings
    configuration: video input: SDI        switch to SDI input
    configuration: video input: HDMI       switch to HDMI input
    configuration: audio input: embedded   capture embedded audio
    configuration: file format: {format}   switch to specific file format

See the HyperDeck manual for further details.
```

# ping

```
ping
```

```
200 ok
```


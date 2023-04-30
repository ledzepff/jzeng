import { JitsiMeeting } from '@jitsi/react-sdk';
import React, { useRef, useState, useEffect } from 'react';

import './App.css';
		/*const temp = speakerList.map((data, idx) => {
			let tempData = {...data} // Copy object
			tempData.selected = tempData.deviceId != speakerName ? "" : " selected";// Set new field
			return tempData;
		});
		setSpeakerList(speakerList);*/
const App = () => {
	const params = new URLSearchParams(window.location.search);
    const apiRef = useRef();
    const [ logItems, updateLog ] = useState([]);
    const [ showNew, toggleShowNew ] = useState(false);
    const [ knockingParticipants, updateKnockingParticipants ] = useState([]);
	const [ micState, setMicState ] = useState(true);
	const [ speakerState, setSpeakerState ] = useState(true);
	const [ micName, setMicName ] = useState('default');
	const [ speakerName, setSpeakerName ] = useState('default');
	const [ micList, setMicList ] = useState([]);
	const [ speakerList, setSpeakerList ] = useState([]);
	const [ deviceList, setDeviceList ] = useState([]);
	const [ moderAudioStatus, setModerAudioStatus ] = useState(false);
	const [ moderVideoStatus, setModerVideoStatus ] = useState(false);
	const [ moderAudioText, setModerAudioText ] = useState("Moderate Audio");
	const [ moderVideoText, setModerVideoText ] = useState("Moderate Video");
	const [ audioModerated, setAudioModerated ] = useState(false);
	const [ videoModerated, setVideoModerated ] = useState(false);
	const [ participantId, setParticipantId ] = useState('');
	const [ displayName, setDisplayName ] = useState('');
	var counter = 1;
	var tempList1 = [];
	var tempList2 = [];

	useEffect(() => { // this hook will get called every time myArr has changed
	   if (micState) {
			updateLog(items => [ ...items, `mic found` ]);
		} else {
			updateLog(items => [ ...items, `no mic connected` ]);
		}
		if (speakerState) {
			updateLog(items => [ ...items, `speakers found` ]);
		} else {
			updateLog(items => [ ...items, `no speakers connected` ]);
		}
	}, [micState, speakerState]);

	useEffect(() => { // this hook will get called every time myArr has changed
		if (speakerList.length > 0) {
			const defaultSpeaker = speakerList.find(dev => {
				return dev.deviceId === "default";
			});
			const firstSpeaker = speakerList[0];
			if (defaultSpeaker != undefined) {
				console.log("Setting default speaker");
				handleDeviceSelection(defaultSpeaker.kind, defaultSpeaker.deviceId, defaultSpeaker.label);
			} else {
				handleDeviceSelection(firstSpeaker.kind, firstSpeaker.deviceId, firstSpeaker.label);
			}
		}
		
	}, [speakerList]);

	useEffect(() => { // this hook will get called every time myArr has changed
		if (micList.length > 0) {
			const defaultMic = micList.find(dev => {
				return dev.deviceId === "default";
			});
			const firstMic = micList[0];
			if (defaultMic != undefined) {
				console.log("Setting default microphone");
				handleDeviceSelection(defaultMic.kind, defaultMic.deviceId, defaultMic.label);
			} else {
				handleDeviceSelection(firstMic.kind, firstMic.deviceId, firstMic.label);
			}
		}
		
	}, [micList]);

	useEffect(() => { // this hook will get called every time myArr has changed
		if (speakerList.length > 0) {
			const speaker = speakerList.find(dev => {
				return dev.deviceId === speakerName;
			});
			if (speaker != undefined) {
				console.log("Setting speaker " + speakerName);
				handleDeviceSelection(speaker.kind, speaker.deviceId, speaker.label);
			}
		}
		
	}, [speakerName]);

	useEffect(() => { // this hook will get called every time myArr has changed
		if (micList.length > 0) {
			const mic = micList.find(dev => {
				return dev.deviceId === micName;
			});
			if (mic != undefined) {
				console.log("Setting mic " + micName);
				handleDeviceSelection(mic.kind, mic.deviceId, mic.label);
			}
		}
		
	}, [micName]);

	const arraysAreEqual = (a, b) => {
		return JSON.stringify(a) === JSON.stringify(b);
	};

    const printEventOutput = payload => {
        updateLog(items => [ ...items, JSON.stringify(payload) ]);
    };

    const handleParticipantJoined = (payload) => {
		setParticipantId(payload.id);
		setDisplayName(payload.displayName);
    };

    const handleAudioStatusChange = (payload, feature) => {
        if (payload.muted) {
            updateLog(items => [ ...items, `${feature} off` ]);
        } else {
            updateLog(items => [ ...items, `${feature} on` ]);
        }
    };

    const handleModerationStatusChange = (payload) => {
        if (payload.enabled) {
            updateLog(items => [ ...items, `${payload.mediaType} moderated` ]);
			if (payload.mediaType == "audio") {
				setAudioModerated(true);
			} else {
				setVideoModerated(true);
			}
        } else {
            updateLog(items => [ ...items, `${payload.mediaType} allowed` ]);
			if (payload.mediaType == "audio") {
				setAudioModerated(false);
			} else {
				setVideoModerated(false);
			}
        }
    };

	const handleAudioAvailabilityChange = (payload) => {
		if (payload.available) {
            showDevices();
        }
	}

	const handleDeviceListChange = (payload) => {
		const outputs = payload.devices.audioOutput.slice(0, payload.devices.audioOutput.length);
		const inputs = payload.devices.audioInput.slice(0, payload.devices.audioOutput.length);
		if (!arraysAreEqual(tempList1, outputs)) {
			tempList1.splice(0, tempList1.length);
			tempList1 = outputs.slice(0, outputs.length);
			console.log("New speaker list " + (counter ++));
			console.log(payload.devices.audioOutput);
			setupAudioDevices(payload.devices, "output");
		}
		if (!arraysAreEqual(tempList2, inputs)) {
			tempList2.splice(0, tempList2.length);
			tempList2 = inputs.slice(0, inputs.length);
			console.log("New mic list " + (counter ++));
			console.log(payload.devices.audioOutput);
			setupAudioDevices(payload.devices, "input");
		}
	}

    const handleWhiteboardStatusChange = (payload) => {
		updateLog(items => [ ...items, `whiteboard status ${payload.status}` ])
        /*if (payload.open) {
            updateLog(items => [ ...items, `whiteboard on` ])
        } else {
            updateLog(items => [ ...items, `whiteboard off` ])
        }*/
    };

    const handleChatUpdates = payload => {
        if (payload.isOpen || !payload.unreadCount) {
            return;
        }
        apiRef.current.executeCommand('toggleChat');
        updateLog(items => [ ...items, `you have ${payload.unreadCount} unread messages` ])
    };

    const handleKnockingParticipant = payload => {
        updateLog(items => [ ...items, JSON.stringify(payload) ]);
        updateKnockingParticipants(participants => [ ...participants, payload?.participant ])
    };

	const showAudioDevicesState = () => {
		if (micState) {
			updateLog(items => [ ...items, `mic found` ]);
		} else {
			updateLog(items => [ ...items, `no mic connected` ]);
		}
		if (speakerState) {
			updateLog(items => [ ...items, `speakers found` ]);
		} else {
			updateLog(items => [ ...items, `no speakers connected` ]);
		}
	}

    const resolveKnockingParticipants = condition => {
        knockingParticipants.forEach(participant => {
            apiRef.current.executeCommand('answerKnockingParticipant', participant?.id, condition(participant));
            updateKnockingParticipants(participants => participants.filter(item => item.id === participant.id));
        });
    };

    const handleJitsiIFrameRef1 = iframeRef => {
        iframeRef.style.border = '10px solid #3d3d3d';
        iframeRef.style.background = '#3d3d3d';
        iframeRef.style.height = '400px';
        iframeRef.style.marginBottom = '20px';
    };

    const handleJitsiIFrameRef2 = iframeRef => {
        iframeRef.style.marginTop = '10px';
        iframeRef.style.border = '10px dashed #df486f';
        iframeRef.style.padding = '5px';
        iframeRef.style.height = '400px';
    };

    const handleJaaSIFrameRef = iframeRef => {
        iframeRef.style.border = '10px solid #3d3d3d';
        iframeRef.style.background = '#3d3d3d';
        iframeRef.style.height = '400px';
        iframeRef.style.marginBottom = '20px';
    };

	const moderateAudio = () => {
		if (!moderAudioStatus) {
			apiRef.current.executeCommand('toggleModeration', true, 'audio');
			setModerAudioText("Allow Audio");
		} else {
			apiRef.current.executeCommand('toggleModeration', false, 'audio');
			setModerAudioText("Moderate Audio");
		}
		setModerAudioStatus(!moderAudioStatus);
	};

	const askToUnmute = () => {
		if (audioModerated) {
			apiRef.current.executeCommand('askToUnmute', participantId);
		}
	};

	const moderateVideo = () => {
		if (!moderVideoStatus) {
			apiRef.current.executeCommand('toggleModeration', true, 'video');
			setModerVideoText("Allow Video");
		} else {
			apiRef.current.executeCommand('toggleModeration', false, 'video');
			setModerVideoText("Moderate Video");
		}
		setModerVideoStatus(!moderVideoStatus);
	};

    const handleApiReady = apiObj => {
        apiRef.current = apiObj;

		//setupAudioDevices();
        apiRef.current.on('participantJoined', payload => handleParticipantJoined(payload));
		apiRef.current.on('audioAvailabilityChanged', payload => handleAudioAvailabilityChange(payload));
		apiRef.current.on('deviceListChanged', payload => handleDeviceListChange(payload));
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
        apiRef.current.on('audioMuteStatusChanged', payload => handleAudioStatusChange(payload, 'audio'));
        apiRef.current.on('videoMuteStatusChanged', payload => handleAudioStatusChange(payload, 'video'));
		apiRef.current.on('whiteboardStatusChanged', payload => handleWhiteboardStatusChange(payload));
		apiRef.current.on('moderationStatusChanged', payload => handleModerationStatusChange(payload));
        apiRef.current.on('raiseHandUpdated', printEventOutput);
        apiRef.current.on('titleViewChanged', printEventOutput);
        apiRef.current.on('chatUpdated', handleChatUpdates);
        apiRef.current.on('knockingParticipant', handleKnockingParticipant);
    };

	const checkAudio = () => {
		apiRef.current.isAudioAvailable().then(available => {
			console.log("available " + available);
		});
		apiRef.current.isAudioDisabled().then(disabled => {
			console.log("disabled " + disabled);
		});
	};

	const showDevices = () => {
		console.log("showDevices clicked");
		apiRef.current.getAvailableDevices().then(devices => {
			console.log(devices);
		});
	};
/*
const temp = speakerList.map((data, idx) => {
			let tempData = {...data} // Copy object
			tempData.selected = tempData.deviceId != speakerName ? "" : " selected";// Set new field
			return tempData;
		});
		setSpeakerList(speakerList);
		*/
	const setupAudioDevicesResolve = (devices, mediaType) => {
		if (mediaType === "all" || mediaType === "input") {
			setMicState((devices.audioInput.length > 0));
		}
		if (mediaType === "all" || mediaType === "output") {
			setSpeakerState((devices.audioOutput.length > 0));
		}
		if (mediaType === "all" || mediaType === "output") {
			const outputs = devices.audioOutput.slice(0, devices.audioOutput.length).map((data, idx) => {
				let tempData = {...data}; // Copy object
				tempData.key = tempData.kind + "_" + tempData.deviceId;
				return tempData;
			});
			setSpeakerList(outputs);
		}
		if (mediaType === "all" || mediaType === "input") {
			const inputs = devices.audioInput.slice(0, devices.audioInput.length).map((data, idx) => {
				let tempData = {...data}; // Copy object
				tempData.key = tempData.kind + "_" + tempData.deviceId;
				return tempData;
			});
			setMicList(inputs);
		}
		/*
		[
    {
        "deviceId": "default",
        "kind": "audioinput",
        "label": "Default - Microphone (Conexant ISST Audio)",
        "groupId": "5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1"
    },
    {
        "deviceId": "communications",
        "kind": "audioinput",
        "label": "Communications - Microphone (Conexant ISST Audio)",
        "groupId": "5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1"
    },
    {
        "deviceId": "d30e9b44789de99f9aa93c80d94161080a4348ac788b6124f8c00b6213cdd496",
        "kind": "audioinput",
        "label": "Microphone (Conexant ISST Audio)",
        "groupId": "5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1"
    }
]
*/
		//console.log(inputs);
		//setMicList([{'kind':'audioinput','deviceId':'default','label':'Mic1','groupId':'5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1','key':'audioinput_default'}]);
		/*
		setMicList([
			{'kind':'audioinput','deviceId':'default','label':'Default - Microphone (Conexant ISST Audio)','groupId':'5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1','key':'audioinput_default'},
			{'kind':'audioinput','deviceId':'communicationst','label':'Communications - Microphone (Conexant ISST Audio)','groupId':'5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1','key':'audioinput_communicationst'},
			{'kind':'audioinput','deviceId':'d30e9b44789de99f9aa93c80d94161080a4348ac788b6124f8c00b6213cdd496','label':'Microphone (Conexant ISST Audio)','groupId':'5b98810cac2f767bfa162ba42c4befbb1a28c9cf604fddd54ee102a050e757f1','key':'audioinput_d30e9b44789de99f9aa93c80d94161080a4348ac788b6124f8c00b6213cdd496'},
		]);
		*/
		//console.log("input " + devices.audioInput.length + " " + (devices.audioInput.length > 0));
		//console.log("output " + devices.audioOutput.length + " " + (devices.audioOutput.length > 0) + " " + speakerState);
		//showAudioDevicesState();
	}

	const setupAudioDevices = (devices = null, mediaType = "all") => {
		if (devices == null) {
			apiRef.current.getAvailableDevices().then(devs => {
				setupAudioDevicesResolve(devs, mediaType);
			});
		} else {
			setupAudioDevicesResolve(devices, mediaType);
		}
	};

    const handleReadyToClose = () => {
        /* eslint-disable-next-line no-alert */
        alert('Ready to close...');
    };

	const handleSpeakerSelection = (e) => {
		setSpeakerName(e.target.value);
	};

	const handleMicSelection = (e) => {
		setMicName(e.target.value);
	};

	const handleDeviceSelection = (kind, id, label) => {
		if (kind.toLowerCase() == 'audioinput') {
			apiRef.current.setAudioInputDevice(label, id);
		} else if (kind.toLowerCase() == 'audiooutput') {
			apiRef.current.setAudioOutputDevice(label, id);
		}
	};

    //const generateRoomName = () => `JitsiMeetRoomNo${Math.random() * 100}-${Date.now()}`;
	const generateRoomName = () => {
		return "TestRec";
	};
	const generateDisplayName = () => {
		return "Guest Guestov";
	};
	const getJWT = () => {
		let jwt = params.get("jwt");
		if (jwt == undefined) {
			jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6IjZBMTdBMzgzOTFGRDU3NTIzMjI5QzhDQjE2N0VDOEQ4Iiwic3ViIjoiKiIsImV4cCI6MTY5OTUyMTk5Mywicm9vbSI6IioiLCJjb250ZXh0Ijp7InVzZXIiOnsiaWQiOiI4MDFFODVGQi1BRkExLTQzMjUtODM2OS0yRTM1RjhCMUQxMjQiLCJhZmZpbGlhdGlvbiI6Im93bmVyIiwidHpPZmZzZXQiOjQuMH0sInJvb20iOnsic3RhcnRUaW1lIjotMSwiZW5kVGltZSI6LTEsInJlZ2V4Ijp0cnVlfSwiZ3JvdXAiOiJndWVzdCJ9fQ.B6wiGoWEZ2RnaQPd9P_zgkxjHRvxAMzY5OcVObL65_0";
		}

		return jwt;
	};
	const jitsiDomain = "vs1.zenget.az";

    // Multiple instances demo
    const renderNewInstance = () => {
        if (!showNew) {
            return null;
        }

        return (
            <JitsiMeeting
                roomName = { generateRoomName() }
                getIFrameRef = { handleJitsiIFrameRef2 } />
        );
    };

    const renderButtons = () => (
        <div style = {{ margin: '15px 0' }}>
            <div style = {{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    type = 'text'
                    title = 'Click to execute toggle raise hand command'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#f8ae1a',
                        color: '#040404',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('toggleRaiseHand') }>
                    Raise hand
                </button>
				<button
                    type = 'text'
                    title = 'Click to mute/unmute video'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#f8ae1a',
                        color: '#040404',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('toggleVideo') }>
                    Mute/Unmute Video
                </button>
				<button
                    type = 'text'
                    title = 'Click to mute/unmute audio'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#f8ae1a',
                        color: '#040404',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('toggleAudio') }>
                    Mute/Unmute Audio
                </button>
				<button
                    type = 'text'
                    title = 'Click to show/hide whiteboard'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('toggleWhiteboard') }>
                    Show/Hide Whiteboard
                </button>
                <button
                    type = 'text'
                    title = 'Click to approve/reject knocking participant'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => resolveKnockingParticipants(({ name }) => !name.includes('test')) }>
                    Resolve lobby
                </button>
            </div>
            <div style = {{
                display: 'flex',
                justifyContent: 'center'
            }}>
				<button
                    type = 'text'
                    title = 'Close Everyones Cam'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('muteEveryone', 'video') }>
                    Close Everyone's Cam
                </button>
				<button
                    type = 'text'
                    title = 'Mute Everyone'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('muteEveryone', 'audio') }>
                    Mute Everyone
                </button>
				<button
                    type = 'text'
                    title = {moderAudioText}
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => moderateAudio() }>
                   {moderAudioText}
                </button>
				<button
                    type = 'text'
                    title = 'Ask To Unmute'
					disabled = {!audioModerated}
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => askToUnmute() }>
                   Ask To Unmute
                </button>
				<button
                    type = 'text'
                    title = {moderVideoText}
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#0056E0',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => moderateVideo() }>
                    {moderVideoText}
                </button>
            </div>
            <div style = {{
                display: 'flex',
                justifyContent: 'center'
            }}>
				<select value={speakerName} onChange={handleSpeakerSelection}> 
				  <option value="⬇0" key={-1}> -- Select a speaker -- </option>
				  {speakerList.map((speaker) => <option value={speaker.deviceId} key={speaker.key}>{speaker.label}</option>)}
				</select>
				<select value={micName} onChange={handleMicSelection}> 
				  <option value="⬇0" key={-2}> -- Select a mic -- </option>
				  {micList.map((mic) => <option value={mic.deviceId} key={mic.key}>{mic.label}</option>)}
				</select>
                <button
                    type = 'text'
                    title = 'Click to execute subject command'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#df486f',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => apiRef.current.executeCommand('subject', 'New Subject')}>
                    Change subject
                </button>
                <button
                    type = 'text'
                    title = 'Click to create a new JitsiMeeting instance'
                    style = {{
                        border: 0,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#3D3D3D',
                        color: 'white',
                        padding: '12px 46px',
                        margin: '2px 2px'
                    }}
                    onClick = { () => toggleShowNew(!showNew) }>
                    Toggle new instance
                </button>
            </div>
        </div>
    );

    const renderLog = () => logItems.map(
        (item, index) => (
            <div
                style = {{
                    fontFamily: 'monospace',
                    padding: '5px'
                }}
                key = { index }>
                {item}
            </div>
        )
    );

	const renderDevices = (devices) => devices.map(
        (device) => (
            <div
                style = {{
                    fontFamily: 'monospace',
                    padding: '5px'
                }}
                key = { device.deviceId }>
				{device.kind.toLowerCase() == 'audioinput' ? "microphone " : "speaker "} 
				<a href={() => false} onClick={handleDeviceSelection(device.kind, device.deviceId, device.label)}>{device.label}</a>
            </div>
        )
    );

    const renderSpinner = () => (
        <div style = {{
            fontFamily: 'sans-serif',
            textAlign: 'center'
        }}>
            Loading..
        </div>
    );


    return (
        <>
            <h1 style = {{
                fontFamily: 'sans-serif',
                textAlign: 'center'
            }}>
                JitsiMeeting Demo App
            </h1>
            <JitsiMeeting
				domain = { jitsiDomain }
                roomName = { generateRoomName() }
				devices = {{
					audioOutput: speakerName,
					audioInput: micName,
					videoInput: 'default'
				}}
				userInfo = {{
					displayName: 'Guest Guestov'
				}}
				configOverwrite = {{
					toolbarButtons: ['camera','chat','microphone'],
					startWithAudioMuted: true,
					startVideoMuted: 1,
					hiddenPremeetingButtons: ['microphone']
				}}
				interfaceConfigOverwrite = {{
					DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
				}}
				jwt = { getJWT() }
                spinner = { renderSpinner }
                config = {{
                    subject: 'Testing Integration',
                    hideConferenceSubject: false
                }}
                onApiReady = { externalApi => handleApiReady(externalApi) }
                onReadyToClose = { handleReadyToClose }
                getIFrameRef = { handleJitsiIFrameRef1 } />

            {renderButtons()}
            {renderNewInstance()}
            {renderLog()}
        </>
    );
};

export default App;
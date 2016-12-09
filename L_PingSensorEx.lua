--
-- PingSensorEx
--

local PING_SENSOR_SID = "urn:dklinkman-com:serviceId:PingSensorEx1"
local SWITCH_POWER_SID = "urn:upnp-org:serviceId:SwitchPower1"
local SECURITY_SENSOR_SID = "urn:micasaverde-com:serviceId:SecuritySensor1"
local HA_DEVICE_SID = "urn:micasaverde-com:serviceId:HaDevice1"
local HA_GATEWAY_SID = "urn:micasaverde-com:serviceId:HomeAutomationGateway1"

local DEBUG_MODE = "1" -- this should be initialized to 0 for a released plugin
local DEFAULT_DEBUG_MODE = "1" -- same here

local DEFAULT_INTERVAL = 15 -- default ping interval is 15 seconds which is pretty responsive
local MINIMUM_INTERVAL = 5 -- limit our ping interval to 5 seconds minimum to prevent excessive pings
local DEFAULT_HOST_ADDRESS = "127.0.0.1" -- default will always succeed, tripping sensor
local DEFAULT_INVERT_STATE = 0 -- default for flag that inverts the sensor state

local DEFAULT_ALLOWED_FAILURES = 0 -- allow a certain number of ping failures before tripping
local DEFAULT_TRIPPED_HOLD_TIME = 0 -- maintain stripped state for specified time (mins)
local DEFAULT_RESET_HOLD_TIME = 0 -- maintain reset state for specified time (mins)
local DEFAULT_TRIPPED_DATETIME = "Not Tripped" -- last tripped formatted date/time

local function log(text)
	luup.log("PingSensorEx " .. text)
end

local function debug(text)
	if (DEBUG_MODE ~= "0") then
		log(text)
	end
end

--
-- get address, interval and other parameters from configuration
-- initialize any parameters that are empty
--
local function readSettings(luu_device)

	local address = luup.variable_get(PING_SENSOR_SID, "Address", luu_device)
	local interval = luup.variable_get(PING_SENSOR_SID, "Interval", luu_device)
	local invert = luup.variable_get(PING_SENSOR_SID, "Invert", luu_device)
	local allowedFailures = luup.variable_get(PING_SENSOR_SID, "AllowedFailures", luu_device)
	local trippedHoldTime = luup.variable_get(PING_SENSOR_SID, "TrippedHoldTime", luu_device)
	local resetHoldTime = luup.variable_get(PING_SENSOR_SID, "ResetHoldTime", luu_device)
	local enable = luup.variable_get(SWITCH_POWER_SID, "Status", luu_device)

	local failureCount = luup.variable_get(PING_SENSOR_SID, "FailureCount", luu_device)
	local lastTripped = luup.variable_get(PING_SENSOR_SID, "LastTrippedDateTime", luu_device)
	
	local lastReset = luup.variable_get(PING_SENSOR_SID, "LastReset", luu_device)
	local trippedDuration = luup.variable_get(PING_SENSOR_SID, "TrippedDuration", luu_device)
	local resetDuration = luup.variable_get(PING_SENSOR_SID, "ResetDuration", luu_device)
	
	if (address == nil or address == "") then
		address = DEFAULT_HOST_ADDRESS
		luup.variable_set(PING_SENSOR_SID, "Address", address, luu_device)
		debug("readSettings() - initialized variable: Address = " .. address)
	end
	if (interval == nil or tonumber(interval) < MINIMUM_INTERVAL) then
		interval = DEFAULT_INTERVAL
		luup.variable_set(PING_SENSOR_SID, "Interval", interval, luu_device)
		debug("readSettings() - initialized variable: Interval = " .. interval)
	end
	if (invert == nil) then
		invert = DEFAULT_INVERT_STATE
		luup.variable_set(PING_SENSOR_SID, "Invert", invert, luu_device)
		debug("readSettings() - initialized variable: Invert = " .. invert)
	end
	if (allowedFailures == nil) then
		allowedFailures = DEFAULT_ALLOWED_FAILURES
		luup.variable_set(PING_SENSOR_SID, "AllowedFailures", allowedFailures, luu_device)
		debug("readSettings() - initialized variable: AllowedFailures = " .. allowedFailures)
	end
	if (failureCount == nil) then
		failureCount = 0
		luup.variable_set(PING_SENSOR_SID, "FailureCount", failureCount, luu_device)
		debug("readSettings() - initialized variable: FailureCount = " .. failureCount)
	end
	if (trippedHoldTime == nil) then
		trippedHoldTime = DEFAULT_TRIPPED_HOLD_TIME
		luup.variable_set(PING_SENSOR_SID, "TrippedHoldTime", trippedHoldTime, luu_device)
		debug("readSettings() - initialized variable: TrippedHoldTime = " .. trippedHoldTime)
	end
	if (resetHoldTime == nil) then
		resetHoldTime = DEFAULT_RESET_HOLD_TIME
		luup.variable_set(PING_SENSOR_SID, "ResetHoldTime", resetHoldTime, luu_device)
		debug("readSettings() - initialized variable: ResetHoldTime = " .. resetHoldTime)
	end
	if (lastTripped == nil) then
		lastTripped = "Not Tripped"
		luup.variable_set(PING_SENSOR_SID, "LastTrippedDateTime", lastTripped, luu_device)
		debug("readSettings() - initialized variable: LastTrippedDateTime = " .. lastTripped)
	end
	if (lastReset == nil) then
	end
	if (trippedDuration == nil) then
		trippedDuration = "00:00:00"
		luup.variable_set(PING_SENSOR_SID, "TrippedDuration", trippedDuration, luu_device)
		debug("readSettings() - initialized variable: TrippedDuration = " .. trippedDuration)
	end
	if (resetDuration == nil) then
		resetDuration = "00:00:00"
		luup.variable_set(PING_SENSOR_SID, "ResetDuration", resetDuration, luu_device)
		debug("readSettings() - initialized variable: ResetDuration = " .. resetDuration)
	end
	if (enable == nil) then
		enable = 1
		luup.variable_set(SWITCH_POWER_SID, "Target", enable, luu_device)
		luup.variable_set(SWITCH_POWER_SID, "Status", enable, luu_device)
		luup.variable_set(HA_DEVICE_SID, "LastUpdate", os.time(os.date('*t')), luu_device)
		luup.variable_set(HA_DEVICE_SID, "Configured", "1", luu_device)
		debug("readSettings() - initialized variable: Target & Status = " .. enable)
	end

	DEBUG_MODE = luup.variable_get(PING_SENSOR_SID, "Debug", luu_device)
	if (DEBUG_MODE == nil) then
		DEBUG_MODE = DEFAULT_DEBUG_MODE
		luup.variable_set(PING_SENSOR_SID, "Debug", DEBUG_MODE, luu_device)		
		debug("readSettings() - initialized variable: Debug = " .. DEBUG_MODE)
	end
	
	return address, interval, invert, allowedFailures, trippedHoldTime, resetHoldTime, enable
end

--
-- register the device type with altui
--
function registerWithAltui()
    for k, v in pairs(luup.devices) do
        if (v.device_type == "urn:schemas-upnp-org:device:altui:1") then
            if luup.is_ready(k) then
                luup.log("Found ALTUI device "..k.." registering PingSensorEx and MultiString devices.")
                local arguments;
                
                -- register the PingSensorEx device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-dklinkman-com:device:PingSensorEx:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawPingSensorEx"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- PingSensorEx
                
                -- register the MultiString device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-upnp-org:device:VContainer:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawMultiString"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- MultiString

                -- register the UPnP Proxy device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-futzle-com:device:UPnPProxy:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawPnPProxy"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- UPnP Proxy

                -- register the VSwitch device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-upnp-org:device:VSwitch:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawVswitch"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- VSwitch

                -- register the CombinationSwitch device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-futzle-com:device:CombinationSwitch:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawCombinationSwitch"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- CombinationSwitch

                -- register the SystemMonitor  device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-cd-jackson-com:device:SystemMonitor:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawSysMonitor"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- SystemMonitor
                
                -- register the ProgramLogicTimerSwitch device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-rts-services-com:device:ProgramLogicTS:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawProgLogicTimerSwitch"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- ProgramLogicTimerSwitch
                
                -- register the MultiSwitch device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-dcineco-com:device:MSwitch:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                --arguments["newScriptFile"] = "J_ALTUI_plugins.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawMultiSwitch"   
                --arguments["newDeviceDrawFunc"] = "ALTUI_PluginDisplays.drawMultiswitch"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                --arguments["newStyleFunc"] = ""   
                arguments["newDeviceIconFunc"] = ""   
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- MultiSwitch
                
                -- register the VeraAlerts device type
                arguments = {}
                arguments["newDeviceType"] = "urn:richardgreen:device:VeraAlert:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawVeraAlerts"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = ""
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- VeraAlerts

                -- register the AutoVera device type
                arguments = {}
                arguments["newDeviceType"] = "urn:joaomgcd:device:AutoVera:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawAutoVeraDashboard"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = "ALTUI_PingSensorExDisplays.drawAutoVeraIcon" -- set the icon too
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- AutoVera

                -- register the InfoViewer device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-a-lurker-com:device:InfoViewer:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawInfoViewerDashboard"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = "ALTUI_PingSensorExDisplays.drawInfoViewerIcon" -- set the icon too
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- InfoViewer

                -- register the combination device type
                arguments = {}
                arguments["newDeviceType"] = "urn:schemas-micasaverde-com:device:ComboDevice:1"   
                arguments["newScriptFile"] = "J_PingSensorEx.js"   
                arguments["newDeviceDrawFunc"] = "ALTUI_PingSensorExDisplays.drawCombDeviceDashboard"   
                arguments["newStyleFunc"] = "ALTUI_PingSensorExDisplays.getStyle"   
                arguments["newDeviceIconFunc"] = "ALTUI_PingSensorExDisplays.drawCombDeviceIcon" -- set the icon too
                arguments["newControlPanelFunc"] = ""   
                luup.call_action("urn:upnp-org:serviceId:altui1", "RegisterPlugin", arguments, k) -- combination device

            else
                luup.log("ALTUI plugin is not yet ready, retry register plugins in a bit..")
                luup.call_delay("registerWithAltui", 10, "", false)
                
            end
            break
        end
    end
    return true
end
        
--
-- the initializeDevice function is used for starting up the device
--
function initializeDevice(luu_device)
	log("initializeDevice() - Device #" .. tostring(luu_device) .. " starting up with id" .. luup.devices[luu_device].id)
	-- fail to start if address and other parameters not configured
	local address, interval, invert, allowedFailures, trippedHoldTime, resetHoldTime, enable = readSettings(luu_device)
	if (address == nil or interval == nil) then
		log("initialize() - Device #" .. tostring(luu_device) .. " starting up with id " .. luup.devices[luu_device].id .. "could not be started")
		luup.set_failure(true, luu_device)
		return false
	end
    registerWithAltui()
	-- defer the first ping and state refresh to the future to avoid slowing down the startup process
	luup.call_timer("refreshCache", 1, "1", "", tostring(luu_device))
	return true
end

--
-- ping the host at hostname or address and return result
-- invert flag may change the result
--
-- TODO: make this a job so it doesn't stall the UI on failed pings
--
local function pingAddress(address)
	local returncode = os.execute("ping -c 1 " .. address)
	local status = "(success)" -- assume success for the log message
	if (returncode ~= 0) then status = "(fail)" end
	log("pingAddress() - ping to host/address '" .. address .. "' returned: " .. returncode .. " " .. status)
	if (returncode == 0) then
		return "1"
	else
		return "0"
	end
end

local n_trip_last_event = 0
local n_reset_last_event = 0
--
-- when sensor state changes store results into the various device variables
--
local function storeResults(luu_device, pingresult, invertstate, trippedhold, resethold)

	debug("storeResults() - called with device: " .. luu_device .. ", pingresult: " .. pingresult .. ", invertstate: " .. invertstate .. ", trippedhold: " .. trippedhold .. ", resethold: " .. resethold)
	
	if (invertstate == "1") then
		if (pingresult == "0") then pingresult = "1" else pingresult = "0" end
		debug("storeResults() - invert flag set inverted ping result to pingresult = " .. pingresult)
	end
	if (pingresult == "1") then
		debug("storeResults() - ping result indicates the sensor was YES TRIPPED")
	else
		debug("storeResults() - ping result indicates the sensor was NOT TRIPPED")
	end

	local tripped = luup.variable_get(SECURITY_SENSOR_SID, "Tripped", luu_device) or "0"
	debug("storeResults() - retrieved current tripped status from user data: " .. tripped)

	if (n_trip_last_event and pingresult == "1") then
		n_trip_last_event = os.time();
		debug("storeResult() - updated n_trip_last_event to the current os time: " .. n_trip_last_event)
	end
	if (n_reset_last_event and pingresult == "0") then
		n_reset_last_event = os.time()
		debug("storeResult() - updated n_reset_last_event to the current os time: " .. n_reset_last_event)
	end

	if (tripped ~= pingresult) then
		debug("storeResult() - current tripped state: " .. tripped .. "and ping result: " .. pingresult .. " indicate a potential state change")
		local n_current_time = os.time()

		last_trip = luup.variable_get(SECURITY_SENSOR_SID, "LastTrip", luu_device) or 0		
		if (n_trip_last_event) then last_trip = tostring(n_trip_last_event) end
		
		debug("storeResults() - last_trip: " .. last_trip .. ", n_trip_last_event: " .. n_trip_last_event .. ", trippedhold: " .. trippedhold)
		if (tripped == "1" and tonumber(last_trip) > 0 and tonumber(trippedhold) > 0) then
			local n_tripped_duration = n_current_time - tonumber(last_trip)
			debug("storeResults() - raw tripped duration: " .. n_tripped_duration .. " secs, trippedhold: " .. (trippedhold * 60))
			if (n_tripped_duration < (tonumber(trippedhold) * 60)) then
				debug("storeResults() - tripped hold has not yet expired duration: " .. (n_tripped_duration / 60) .. " mins")
				n_trip_last_event = tonumber(last_trip)
				return
			end
			n_trip_last_event = 0
			debug("storeResults() - tripped hold has expired now processing state transition")
		end

		debug("storeResults() - setting Tripped state to " .. pingresult .. " and LastUpdate to current time")
		luup.variable_set(SECURITY_SENSOR_SID, "Tripped", pingresult, luu_device)
		luup.variable_set(HA_DEVICE_SID, "LastUpdate", n_current_time, luu_device)
		if (pingresult == "1" and tripped == "0") then
			debug("storeResults() - updating current time for LastTrip and LastTrippedDateTime")
			luup.variable_set(SECURITY_SENSOR_SID, "LastTrip", n_current_time, luu_device)
			luup.variable_set(PING_SENSOR_SID, "LastTrippedDateTime", "<b>" .. os.date("%c", n_current_time) .. "</b>", luu_device)
			n_trip_last_event = 0
		else
			n_reset_last_event = 0
		end
	else
		debug("storeResults() - no change in ping result or sensor state")
	end
end

--
-- Here are all functions started in the correct sequence
-- triggered by a timer
--
function refreshCache(str_device)
	--
	-- Reset the timer at the beginning, just in case the subsequent code fails.
	--
	-- The last parameter is temporary, can be removed in later builds once bug fix
	-- is in place (http://forum.micasaverde.com/index.php?topic=1608.0)
	--
	--debug("refreshCache() - Entered function() str_device: " .. (str_device or "nil"))

	local address, interval, invert, allowedFailures, trippedHoldTime, resetHoldTime, enable = readSettings(tonumber(str_device))

	luup.call_timer("refreshCache", 1, tostring(interval), "", str_device)

	--
	-- To avoid having to be able to "cancel" a running timer, esp after repeated
	-- enable/disable calls, we simply "do nothing" in this code if the timer is
	-- disabled.  The actual timer itself is never stopped, we simply don't respond
	-- if we're disabled.
	--
	if (enable == "1") then
		-- ping the address, store results, inverted if necessary.
		storeResults(tonumber(str_device), pingAddress(address), invert, trippedHoldTime, resetHoldTime)
	else
		debug("refreshCache() - ping sensor disabled via switch state: enable = " .. (enable or "No value"))
	end
end

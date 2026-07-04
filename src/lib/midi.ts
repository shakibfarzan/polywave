/**
 * midi.ts — Web MIDI input (Phase 4).
 *
 * Progressive enhancement: Safari has no Web MIDI, so everything feature-
 * detects and degrades to a "not supported" state instead of failing.
 * Access is only requested on an explicit user action (connect button),
 * never on page load.
 */

export interface MidiEvents {
  /** Fired whenever the set of held notes changes (MIDI note numbers). */
  onNotesChange: (notes: number[]) => void;
  /** Fired when devices connect/disconnect. */
  onDevicesChange: (deviceNames: string[]) => void;
}

export function isMidiSupported(): boolean {
  return typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
}

let access: MIDIAccess | null = null;
const held = new Set<number>();

function listInputs(a: MIDIAccess): string[] {
  return [...a.inputs.values()].map((i) => i.name ?? "MIDI device");
}

/**
 * Request MIDI access and start listening on all inputs. Returns the device
 * list, or throws if the user denies access / the browser lacks support.
 */
export async function connectMidi(events: MidiEvents): Promise<string[]> {
  if (!isMidiSupported()) {
    throw new Error("Web MIDI is not supported in this browser");
  }
  access = await navigator.requestMIDIAccess({ sysex: false });

  const handleMessage = (message: MIDIMessageEvent) => {
    const data = message.data;
    if (!data || data.length < 3) return;
    const status = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];
    if (status === 0x90 && velocity > 0) {
      held.add(note);
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      held.delete(note);
    } else {
      return;
    }
    events.onNotesChange([...held].sort((a, b) => a - b));
  };

  const attachAll = () => {
    if (!access) return;
    for (const input of access.inputs.values()) {
      input.onmidimessage = handleMessage;
    }
    events.onDevicesChange(listInputs(access));
  };

  access.onstatechange = attachAll;
  attachAll();
  return listInputs(access);
}

/** Stop listening and clear held-note state. */
export function disconnectMidi(): void {
  if (access) {
    for (const input of access.inputs.values()) {
      input.onmidimessage = null;
    }
    access.onstatechange = null;
    access = null;
  }
  held.clear();
}

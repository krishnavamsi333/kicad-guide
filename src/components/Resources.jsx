import React from 'react'

const youtube = [
  { tag: 'YouTube · Beginner → Pro', name: "Phil's Lab",           desc: 'Best KiCad channel. Hands-on real projects from simple to complex. Shows full workflow including schematic, layout, and ordering.' },
  { tag: 'YouTube · Advanced',       name: 'Robert Feranec',        desc: 'Industry veteran. Advanced topics: high-speed design, DDR routing, 4-layer stackup, differential pairs. Watch after you have basics down.' },
  { tag: 'YouTube · Beginner',       name: 'Shawn Hymel (DigiKey)', desc: "DigiKey's official KiCad tutorial series. Thorough, slow-paced, great for absolute beginners who want every step explained." },
  { tag: 'YouTube · Beginner',       name: 'EEVblog (Dave Jones)',   desc: 'PCB design fundamentals, common mistakes, design reviews. His "Beginners Guide" video series is a classic starting point.' },
]

const tools = [
  { tag: 'Official Docs',           name: 'kicad.org Documentation',      desc: "The official manual. Dry but comprehensive. Use it as a reference when you can't find a specific feature or setting." },
  { tag: 'Trace Width Calculator',  name: 'PCB Trace Width Calculator',    desc: 'Search "PCB trace width calculator IPC-2221". Plug in current and temperature rise to get the exact trace width for your design.' },
  { tag: 'Component Library',       name: 'SnapEDA / Ultra Librarian',     desc: "Free schematic symbols and PCB footprints. If KiCad doesn't have your component, search here. Download and import directly." },
  { tag: 'Datasheets',              name: 'octopart.com / datasheet.live', desc: 'Fast datasheet search. Always verify your footprint against the actual datasheet — library footprints can have errors.' },
  { tag: 'Forum / Help',            name: 'forum.kicad.info',              desc: 'Official KiCad forum. Very active and helpful. Search before posting — most beginner questions are already answered.' },
  { tag: 'Community',               name: 'r/PrintedCircuitBoard',         desc: 'Reddit community for PCB design. Post your boards for review — people give detailed, constructive feedback. Great for learning from examples.' },
]

function ResourceCard({ tag, name, desc }) {
  return (
    <div className="resource-card">
      <div className="rl-tag">{tag}</div>
      <h4>{name}</h4>
      <p>{desc}</p>
    </div>
  )
}

export default function Resources() {
  return (
    <div className="fade-in">
      <div className="section-title">Learning Resources</div>
      <p className="section-desc">The best free resources for learning KiCad and PCB design, ranked by quality and relevance for beginners.</p>

      <div className="sub-header">YouTube Channels (Best Way to Learn)</div>
      <div className="resource-grid">
        {youtube.map((r, i) => <ResourceCard key={i} {...r} />)}
      </div>

      <div className="sub-header">Tools & References</div>
      <div className="resource-grid">
        {tools.map((r, i) => <ResourceCard key={i} {...r} />)}
      </div>

      <hr className="divider" />
      <div className="callout good">
        <strong>Your first project recommendation:</strong> Design a simple LED blinker with a 555 timer or ATtiny85 microcontroller. Order from JLCPCB (~$2). Solder it. Test it. That one project teaches you the complete workflow and most of these rules will make sense the moment you hold your own board in your hands.
      </div>
    </div>
  )
}
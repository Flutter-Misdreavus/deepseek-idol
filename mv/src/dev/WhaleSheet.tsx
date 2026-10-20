// Dev board: every whale variant on one frame (for design review, not part of the MV).
import { AbsoluteFill } from 'remotion';
import { C } from '../lib/palette';
import { Whale } from '../lib/whale';

const cell: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: 380, height: 300, transform: "scale(1.5)" };

export const WhaleSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.hot, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center' }}>
    <div style={cell}><Whale /></div>
    <div style={cell}><Whale sticker eye="closed" spout={1} /></div>
    <div style={cell}><Whale eye="heart" color="#FFB3CF" wag={-12} /></div>
    <div style={cell}><Whale eye="star" color={C.blue} belly="#DDE6FF" /></div>
    <div style={cell}><Whale silhouette color={C.deep} eye="cursor" eyeColor="#7FE6FF" /></div>
    <div style={{ ...cell, background: '#111' }}><Whale silhouette color="#2A2A33" eye="heart" /></div>
    <div style={cell}><Whale tag="V3" color="#B8C2D6" /></div>
    <div style={cell}><Whale tag="R1" color="#FFC2DA" flip eye="closed" /></div>
    <div style={cell}><Whale silhouette color="#F7B733" /></div>
    <div style={cell}><Whale sticker size={140} color="#FFE27A" eye="star" /></div>
  </AbsoluteFill>
);

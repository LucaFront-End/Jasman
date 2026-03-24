import {
  CircleDot, Settings, Disc, Car, Droplets, BatteryCharging,
  Award, ShieldCheck, Flag, Zap,
  Store, Wrench, TrendingUp, Handshake, Monitor, GraduationCap, Map, Trophy,
  MapPin, Star, Check, Shield, Clock, Phone, Mail,
  ChevronLeft, ChevronRight, ArrowRight, Navigation,
} from 'lucide-react';

const iconMap = {
  // Services
  'circle-dot': CircleDot,
  'settings': Settings,
  'disc': Disc,
  'car': Car,
  'droplets': Droplets,
  'battery-charging': BatteryCharging,
  // About features
  'award': Award,
  'shield-check': ShieldCheck,
  'flag': Flag,
  'zap': Zap,
  // Timeline
  'store': Store,
  'wrench': Wrench,
  'trending-up': TrendingUp,
  'handshake': Handshake,
  'monitor': Monitor,
  'graduation-cap': GraduationCap,
  'map': Map,
  'trophy': Trophy,
  // General
  'map-pin': MapPin,
  'star': Star,
  'check': Check,
  'shield': Shield,
  'clock': Clock,
  'phone': Phone,
  'mail': Mail,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-right': ArrowRight,
  'navigation': Navigation,
};

export default function Icon({ name, size = 20, color, strokeWidth = 2, style, className }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
}

export { iconMap };

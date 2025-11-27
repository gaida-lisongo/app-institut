import PlusIcon from "./plus.svg";
import CloseIcon from "./close.svg";
import BoxIcon from "./box.svg";
import CheckCircleIcon from "./check-circle.svg";
import AlertIcon from "./alert.svg";
import InfoIcon from "./info.svg";
import ErrorIcon from "./info-hexa.svg";
import BoltIcon from "./bolt.svg";
import ArrowUpIcon from "./arrow-up.svg";
import ArrowDownIcon from "./arrow-down.svg";
import FolderIcon from "./folder.svg";
import VideoIcon from "./videos.svg";
import AudioIcon from "./audio.svg";
import GridIcon from "./grid.svg";
import FileIcon from "./file.svg";
import DownloadIcon from "./download.svg";
import ArrowRightIcon from "./arrow-right.svg";
import GroupIcon from "./group.svg";
import BoxIconLine from "./box-line.svg";
import ShootingStarIcon from "./shooting-star.svg";
import DollarLineIcon from "./dollar-line.svg";
import TrashBinIcon from "./trash.svg";
import AngleUpIcon from "./angle-up.svg";
import AngleDownIcon from "./angle-down.svg";
import PencilIcon from "./pencil.svg";
import CheckLineIcon from "./check-line.svg";
import CloseLineIcon from "./close-line.svg";
import ChevronDownIcon from "./chevron-down.svg";
import ChevronUpIcon from "./chevron-up.svg";
import PaperPlaneIcon from "./paper-plane.svg";
import LockIcon from "./lock.svg";
import EnvelopeIcon from "./envelope.svg";
import UserIcon from "./user-line.svg";
import CalenderIcon from "./calender-line.svg";
import EyeIcon from "./eye.svg";
import EyeCloseIcon from "./eye-close.svg";
import TimeIcon from "./time.svg";
import CopyIcon from "./copy.svg";
import ChevronLeftIcon from "./chevron-left.svg";
import UserCircleIcon from "./user-circle.svg";
import TaskIcon from "./task-icon.svg";
import ListIcon from "./list.svg";
import TableIcon from "./table.svg";
import PageIcon from "./page.svg";
import PieChartIcon from "./pie-chart.svg";
import BoxCubeIcon from "./box-cube.svg";
import PlugInIcon from "./plug-in.svg";
import DocsIcon from "./docs.svg";
import MailIcon from "./mail-line.svg";
import HorizontaLDots from "./horizontal-dots.svg";
import ChatIcon from "./chat.svg";
import MoreDotIcon from "./more-dot.svg";
import BellIcon from "./bell.svg";

// Composants d'icônes SVG
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export {
  DownloadIcon,
  BellIcon,
  MoreDotIcon,
  FileIcon,
  GridIcon,
  AudioIcon,
  VideoIcon,
  BoltIcon,
  PlusIcon,
  BoxIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  ErrorIcon,
  ArrowUpIcon,
  FolderIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  GroupIcon,
  BoxIconLine,
  ShootingStarIcon,
  DollarLineIcon,
  TrashBinIcon,
  AngleUpIcon,
  AngleDownIcon,
  PencilIcon,
  CheckLineIcon,
  CloseLineIcon,
  ChevronDownIcon,
  PaperPlaneIcon,
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  CalenderIcon,
  EyeIcon,
  EyeCloseIcon,
  TimeIcon,
  CopyIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  TaskIcon,
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon,
  DocsIcon,
  MailIcon,
  HorizontaLDots,
  ChevronUpIcon,
  ChatIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  TrashIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
};

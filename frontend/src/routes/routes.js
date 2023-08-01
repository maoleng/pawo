import config from '../config'

// Layouts
import { HomeLayout } from '../layouts'
import Home from '../pages/Home'
import FindWork from '../pages/FindWork'
import FindTalent from '../pages/FindTalent'
import CreateWork from '../pages/CreateWork'
import Messages from '../pages/Messages'
import Profile from '../pages/Profile'
import SendProposal from '../pages/SendProposal'
import WorkProposals from '../pages/WorkProposals'
import WorkDashboard from '../pages/WorkDashboard'
import WorkDetail from '../pages/WorkDetail'
import ProposalsDashboard from '../pages/ProposalsDashboard'
import WorkDetailFreelancerSide from '../pages/WorkDetailFreelancerSide'

// Public routes
const publicRoutes = [
    { path: config.routes.home, component: Home, layout: HomeLayout },
    { path: config.routes.findWork, component: FindWork, layout: HomeLayout },
    { path: config.routes.findTalent, component: FindTalent, layout: HomeLayout },
    { path: config.routes.about, component: Home, layout: HomeLayout },
    { path: config.routes.createWork, component: CreateWork, layout: HomeLayout },
    { path: config.routes.messages, component: Messages, layout: HomeLayout },
    { path: config.routes.profile, component: Profile, layout: HomeLayout },
    { path: config.routes.sendProposal, component: SendProposal, layout: HomeLayout },
    { path: config.routes.workProposals, component: WorkProposals, layout: HomeLayout },
    { path: config.routes.workDashboard, component: WorkDashboard, layout: HomeLayout },
    { path: config.routes.workDetail, component: WorkDetail, layout: HomeLayout },
    { path: config.routes.proposalDashboard, component: ProposalsDashboard, layout: HomeLayout },
    { path: config.routes.workDetailFreelancerSide, component: WorkDetailFreelancerSide, layout: HomeLayout },
    { path: config.routes.notFound, component: Home, layout: HomeLayout },
]

export { publicRoutes }

import { useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import CardActions from '@mui/joy/CardActions'
import CardOverflow from '@mui/joy/CardOverflow'
import ButtonGroup from '@mui/joy/ButtonGroup'
import Chip from '@mui/joy/Chip'
import List from '@mui/joy/List'
import Button from '@mui/joy/Button'
import Divider from '@mui/joy/Divider'
import Typography from '@mui/joy/Typography'

import { WalletContext } from '../../App'
import ModalAlert from '../../pages/components/ModalAlert'
import Banner from '../../pages/components/Banner'
import config from '../../config'
import styles from './WorkProposals.module.scss'

const cx = classNames.bind(styles)

function WorkProposals() {
    const { contractId, wallet } = useContext(WalletContext)
    const [proposals, setProposals] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const { state } = useLocation()

    useEffect(() => {
        getAllProposalsOfThisJob(state?.work)
            .then((res) => {
                const { status, data } = JSON.parse(res)
                if (status) {
                    setProposals([...data])
                }
            })
            .catch((alert) => {
                console.log(alert)
            })
        // .finally(() => {
        //     setUiPleaseWait(false)
        // })
    }, [])

    const getAllProposalsOfThisJob = (work) => {
        console.log(work?.id)
        return wallet.viewMethod({ method: 'GetJobRegister', contractId, args: { id: work?.id } })
    }

    const chooseFreelancerHandler = (freelancerId) => {
        console.log(freelancerId)
        wallet
            .callMethod({
                method: 'ChooseFreelancer',
                args: { userId: freelancerId, jobId: state?.work.id },
                contractId,
            })
            .then(async (res) => {
                // return getGreeting()
                console.log(res)
                setOpenModal(true)
            })
        // .then(setValueFromBlockchain)
        // .finally(() => {
        //     setUiPleaseWait(false)
        // })
    }

    return (
        <div>
            <Container>
                <Row>
                    {/* Banner */}
                    <Col xs={12} className={cx('banner-wrapper')}>
                        <Banner title="Browse Work" />
                    </Col>

                    {/* Works grid */}
                    <Col xs={12} md={8}>
                        {proposals?.length > 0 ? (
                            proposals.map((proposal, index) => (
                                <List
                                    key={index}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: 2,
                                    }}
                                >
                                    <Card
                                        component="li"
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 'sm',
                                            p: 2,
                                            listStyle: 'none',
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    src="/static/images/avatar/1.jpg"
                                                    sx={{ '--Avatar-size': '4rem' }}
                                                />
                                                <Box>
                                                    <h5 className={cx('talent-name')}>{proposal.user.accountId}</h5>
                                                    <h6 className={cx('talent-role')}>Blockchain Developer</h6>
                                                </Box>
                                            </Box>
                                            <Divider component="div" sx={{ my: 2 }} />
                                            <Box>
                                                <p className={cx('talent-bio')}>{proposal.message}</p>
                                            </Box>
                                            <Divider component="div" sx={{ my: 2 }} />
                                            <h6 className={cx('skill-tags-title')}>Skills tags</h6>
                                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="lg"
                                                    sx={{ pointerEvents: 'none' }}
                                                >
                                                    BOS
                                                </Chip>
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="lg"
                                                    sx={{ pointerEvents: 'none' }}
                                                >
                                                    React
                                                </Chip>
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="lg"
                                                    sx={{ pointerEvents: 'none' }}
                                                >
                                                    Rust
                                                </Chip>
                                            </Box>
                                        </CardContent>
                                        <CardOverflow sx={{ mt: 1 }}>
                                            <CardActions buttonFlex="1">
                                                <ButtonGroup variant="outlined" sx={{ bgcolor: 'background.surface' }}>
                                                    <Button>
                                                        <Link to={config.routes.messages} style={{ color: 'inherit' }}>
                                                            Message
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            chooseFreelancerHandler(proposal.user.id)
                                                        }}
                                                    >
                                                        Choose
                                                    </Button>
                                                </ButtonGroup>
                                            </CardActions>
                                        </CardOverflow>
                                    </Card>
                                </List>
                            ))
                        ) : (
                            <Card
                                variant="outlined"
                                orientation="horizontal"
                                sx={{
                                    p: '10px 20px',
                                    width: 1,
                                    '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },
                                }}
                            >
                                <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                                    <Typography level="h2" id="card-description" sx={{ mb: 1, fontSize: '1.4rem' }}>
                                        Be patient. Our talents will apply to your job soon
                                    </Typography>
                                    <Chip
                                        variant="outlined"
                                        color="warning"
                                        size="lg"
                                        sx={{ my: 1, pointerEvents: 'none' }}
                                    >
                                        Keep waiting
                                    </Chip>
                                </CardContent>
                            </Card>
                        )}
                    </Col>

                    {/* Work card */}
                    <Col xs={0} md={4}>
                        <Card
                            variant="outlined"
                            sx={{
                                width: '100%',
                            }}
                            className={cx('work-wrapper')}
                        >
                            <CardContent>
                                <Box>
                                    <Row>
                                        <Col xs={12}>
                                            <h5 className={cx('work-title')}>{state?.work.title}</h5>
                                        </Col>
                                        <Col xs={12}>
                                            <small className={cx('work-subtitle')}>
                                                <span
                                                    className={cx('work-subtitle_price')}
                                                >{`Fixed price: $${state?.work.money}`}</span>
                                                <span>
                                                    &nbsp;-&nbsp;<span>Entry level</span>
                                                </span>
                                            </small>
                                        </Col>
                                    </Row>
                                </Box>
                                <Box>
                                    <p className={cx('work-desc')}>{state?.work.description}</p>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                    {state?.work.categories.map((category, index) => (
                                        <Chip
                                            variant="soft"
                                            color="neutral"
                                            size="lg"
                                            sx={{ pointerEvents: 'none' }}
                                            key={index}
                                        >
                                            {category}
                                        </Chip>
                                    ))}
                                    <Chip variant="soft" color="neutral" size="lg" sx={{ pointerEvents: 'none' }}>
                                        AI
                                    </Chip>
                                    <Chip variant="soft" color="neutral" size="lg" sx={{ pointerEvents: 'none' }}>
                                        UI/UX
                                    </Chip>
                                </Box>
                            </CardContent>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ModalAlert
                open={openModal}
                setOpen={setOpenModal}
                message="You and this talents are connected. Hope both of you have a great journey."
                backPath={config.routes.workDashboard}
            />
        </div>
    )
}

export default WorkProposals

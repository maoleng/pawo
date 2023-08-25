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
import Banner from '../../pages/components/Banner'
import ErrorMessage from '../../pages/components/ErrorMessage'
import ModalAlert from '../../pages/components/ModalAlert'
import ModalLoading from '../../pages/components/ModalLoading'
import config from '../../config'
import { axiosInstance } from '../../utils/axiosInstance'
import styles from './WorkProposals.module.scss'

const cx = classNames.bind(styles)

function WorkProposals() {
    const { contractId, wallet } = useContext(WalletContext)
    const [proposals, setProposalList] = useState([])
    const [openModalAlert, setOpenModalAlert] = useState(false)
    const [openModalLoading, setOpenModalLoading] = useState(false)
    const [error, setError] = useState({ status: false, message: '' })

    const { state } = useLocation()

    useEffect(() => {
        ;(async () => {
            await axiosInstance({
                method: 'GET',
                url: `job_user?_filter=jobId:${state?.work.id}&_fields=jobId,userId,message,createdAt,jobObj,userObj&_noPagination=1`,
            })
                .then((res) => {
                    if (res.data.status) {
                        console.log(res.data.data)
                        setProposalList([...res.data.data])
                    }
                    console.log(res)
                })
                .catch((res) => {
                    console.log(res)
                })
        })()
    }, [])

    const chooseFreelancerHandler = async (freelancerId) => {
        console.log(freelancerId)
        setOpenModalLoading(true)
        const data = { userId: freelancerId, jobId: state?.work.id }

        await axiosInstance({
            method: 'POST',
            url: `job/choose/${data.jobId}`,
            data: { userId: data.userId },
            headers: {
                Authorization: wallet.accountId,
            },
        })
            .then(async (res) => {
                if (res.data.status) {
                    await wallet.callMethod({
                        method: 'ChooseFreelancer',
                        args: data,
                        contractId,
                    })
                    setError({ status: false })
                    setOpenModalAlert(true)
                } else {
                    setError({ status: true, message: res?.data?.message })
                }
            })
            .catch((res) => {
                console.log(res)
                setError({ status: true, message: res?.message })
            })
            .finally(() => {
                setOpenModalLoading(false)
            })
    }

    return (
        <div>
            <Container>
                <Row>
                    {/* Banner */}
                    <Col xs={12} className={cx('banner-wrapper')}>
                        <Banner title="Browse Work" />
                    </Col>

                    {error.status && (
                        <Col xs={12}>
                            <ErrorMessage message={error.message} />
                        </Col>
                    )}

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
                                                    <h5 className={cx('talent-name')}>tilux.testnet</h5>
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
                                                            chooseFreelancerHandler(proposal.userId)
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
                open={openModalAlert}
                setOpen={setOpenModalAlert}
                message="You and this talents are connected. Hope both of you have a great journey."
                backPath={config.routes.workDashboard}
            />
            <ModalLoading
                open={openModalLoading}
                setOpen={setOpenModalLoading}
                title="Sending"
                message="We are preparing your proposal to be sent."
            />
        </div>
    )
}

export default WorkProposals

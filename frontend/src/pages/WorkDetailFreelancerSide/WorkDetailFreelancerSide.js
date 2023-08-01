import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import CardActions from '@mui/joy/CardActions'
import Chip from '@mui/joy/Chip'
import Divider from '@mui/joy/Divider'
import AspectRatio from '@mui/joy/AspectRatio'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import { DocumentFolderRegular } from '@fluentui/react-icons'

import { WalletContext } from '../../App'
import Banner from '../../pages/components/Banner'
import ModalAlert from '../../pages/components/ModalAlert'
import ModalRating from '../../pages/components/ModalRating'
import config from '../../config'
import styles from './WorkDetailFreelancerSide.module.scss'

const cx = classNames.bind(styles)

function WorkDetailFreelancerSide() {
    const { contractId, wallet } = useContext(WalletContext)
    const [work, setWork] = useState({})
    const [openModalSubmitProduct, setOpenModalSubmitProduct] = useState(false)
    const [openModalRating, setOpenModalRating] = useState(false)
    const [openModalRatingSuccess, setOpenModalRatingSuccess] = useState(false)
    const { state } = useLocation()

    useEffect(() => {
        console.log(state?.work)
        setWork({ ...state?.work })
    }, [])

    const submitProductHandler = (e) => {
        e.preventDefault()

        wallet
            .callMethod({ method: 'SendPaymentRequest', args: { id: state?.work.id }, contractId })
            .then(async (res) => {
                // return getGreeting()
                console.log(res)
                setOpenModalSubmitProduct(true)
            })
            .catch((res) => {
                console.log(res)
            })
        // .then(setValueFromBlockchain)
        // .finally(() => {
        //     setUiPleaseWait(false)
        // })
    }

    const rateEmployerHandler = (e) => {
        e.preventDefault()
        const { commentRating, starRating } = e.target.elements

        wallet
            .callMethod({
                method: 'Evaluate',
                args: {
                    userId: work?.creator?.id,
                    jobId: work?.id,
                    star: starRating.value,
                    message: commentRating.value,
                },
                contractId,
            })
            .then(async (res) => {
                // return getGreeting()
                console.log(res)
                setOpenModalRating(false)
                setOpenModalRatingSuccess(true)
            })
            .catch((res) => {
                console.log(res)
            })
    }

    const workStatusConvert = (status) => {
        switch (status) {
            case 2:
                return 'Pending'
            case 3:
                return 'Stopped'
            case 4:
                return 'Paid'
            case 5:
                return 'Cancelled'
            default:
                return 'Processing'
        }
    }

    return (
        <div>
            <Container>
                <Row>
                    {/* Banner */}
                    <Col xs={12} className={cx('banner-wrapper')}>
                        <Banner title="Work Detail" />
                    </Col>

                    {/* Works detail */}
                    <Col xs={12} lg={8}>
                        <Card
                            variant="outlined"
                            sx={{
                                maxHeight: 'max-content',
                                maxWidth: '100%',
                                mx: 'auto',
                                px: '40px',
                                py: '32px',
                            }}
                        >
                            <h3 className={cx('form-title')}>Work Detail</h3>
                            <Divider insert="none" sx={{ '--Divider-lineColor': 'rgb( 115 115 140)' }} />
                            <CardContent sx={{ mt: '20px' }}>
                                <Row>
                                    <Col xs={12}>
                                        <Box>
                                            <Row>
                                                <Col xs={12}>
                                                    <Row>
                                                        <Col xs={12} md={6}>
                                                            <h5 className={cx('work-title')}>{state?.work.title}</h5>
                                                        </Col>
                                                        <Col xs={12} md={6} className={cx('work-condition')}>
                                                            <Chip
                                                                variant="soft"
                                                                size="sm"
                                                                color={
                                                                    {
                                                                        Pending: 'success',
                                                                        Processing: 'neutral',
                                                                        Cancelled: 'danger',
                                                                    }[
                                                                        state?.work.status === '1'
                                                                            ? 'Processing'
                                                                            : state?.work.status === '2' || state?.work.status === '4'
                                                                            ? 'Pending'
                                                                            : 'Cancelled'
                                                                    ]
                                                                }
                                                                sx={{ fontSize: '1.4rem', p: '2px 10px' }}
                                                            >
                                                                {workStatusConvert(state?.work.status)}
                                                            </Chip>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12}>
                                                    <small className={cx('work-subtitle')}>
                                                        <span>Entry level</span>
                                                    </small>
                                                </Col>
                                                <Col xs={12}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            marginTop: '10px',
                                                        }}
                                                    >
                                                        {state?.work?.categories.map((category, index) => (
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
                                                        <Chip
                                                            variant="soft"
                                                            color="neutral"
                                                            size="lg"
                                                            sx={{ pointerEvents: 'none' }}
                                                        >
                                                            AI
                                                        </Chip>
                                                        <Chip
                                                            variant="soft"
                                                            color="neutral"
                                                            size="lg"
                                                            sx={{ pointerEvents: 'none' }}
                                                        >
                                                            UI/UX
                                                        </Chip>
                                                    </Box>
                                                </Col>
                                            </Row>
                                        </Box>
                                    </Col>
                                    <Col xs={12}>
                                        <Box sx={{ mt: '20px' }}>
                                            <h5 className={cx('work-price')}>{`Price: $${state?.work.money}`}</h5>
                                        </Box>
                                    </Col>
                                </Row>
                                {(state?.work.status === 3 || state?.work.status === 4) && (
                                    <CardActions sx={{ gridColumn: '1/-1', mt: '24px' }}>
                                        <button
                                            className="save-btn btn rounded-pill btn-primary-style"
                                            onClick={() => {
                                                setOpenModalRating(true)
                                            }}
                                        >
                                            Review employer
                                        </button>
                                    </CardActions>
                                )}
                            </CardContent>
                        </Card>
                    </Col>

                    {/* Submission card */}
                    <Col xs={0} md={4}>
                        <Card
                            variant="outlined"
                            sx={[
                                {
                                    p: '32px 40px',
                                    width: '100%',
                                    gap: 1.5,
                                    alignItems: 'flex-start',
                                    borderColor: 'hsl(244, 100%, 50%)',
                                },
                            ]}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AspectRatio
                                        ratio="1"
                                        variant="soft"
                                        color="primary"
                                        sx={{
                                            minWidth: 32,
                                            borderRadius: '50%',
                                            '--Icon-fontSize': '16px',
                                        }}
                                    >
                                        <div>
                                            <DocumentFolderRegular />
                                        </div>
                                    </AspectRatio>
                                    <Box>
                                        <h5 className={cx('submission-title')}>Submission</h5>
                                    </Box>
                                </Box>
                                <Box>
                                    <h5 className={cx('work-due')}>Due date: Sat, July 31, 2023</h5>
                                </Box>
                            </Box>
                            <form className={cx('submit-product-form')} onSubmit={submitProductHandler}>
                                <CardContent
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                        gap: 1.5,
                                    }}
                                >
                                    <FormControl sx={{ gridColumn: '1/-1' }}>
                                        <FormLabel>Title</FormLabel>
                                        <Input
                                            slotProps={{
                                                input: {
                                                    name: 'submissionTitle',
                                                },
                                            }}
                                        />
                                    </FormControl>
                                    <FormControl sx={{ gridColumn: '1/-1' }}>
                                        <FormLabel>Content</FormLabel>
                                        <Input
                                            slotProps={{
                                                input: {
                                                    name: 'submissionContent',
                                                },
                                            }}
                                        />
                                    </FormControl>
                                    <CardActions sx={{ gridColumn: '1/-1', mt: '24px' }}>
                                        <button
                                            className="save-btn btn rounded-pill btn-primary-style"
                                            style={{ width: '100%' }}
                                            type="submit"
                                        >
                                            Submit
                                        </button>
                                    </CardActions>
                                </CardContent>
                            </form>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ModalAlert
                open={openModalSubmitProduct}
                setOpen={setOpenModalSubmitProduct}
                message="Your work've sent to client successfully! Be patient to wait response from them."
                backPath={config.routes.proposalDashboard}
            />
            <ModalAlert
                open={openModalRatingSuccess}
                setOpen={setOpenModalRatingSuccess}
                message="Thanks for your hard working. Let's explore new works now!"
                btnMessage="Browse new works"
                backPath={config.routes.findWork}
            />
            <ModalRating
                open={openModalRating}
                setOpen={setOpenModalRating}
                title="Review your client"
                message="Please review your client to enhance your network."
                submitFormHandler={rateEmployerHandler}
            />
        </div>
    )
}

export default WorkDetailFreelancerSide

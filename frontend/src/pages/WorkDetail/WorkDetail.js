import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import format from 'date-fns/format'
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
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { DocumentFolderRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons'
import { WalletContext } from '../../App'
import Banner from '../../pages/components/Banner'
import ModalAlert from '../../pages/components/ModalAlert'
import ModalEdit from '../../pages/components/ModalEdit'
import ModalLoading from '../../pages/components/ModalLoading'
import ModalRating from '../../pages/components/ModalRating'
import config from '../../config'
import styles from './WorkDetail.module.scss'

const cx = classNames.bind(styles)

function WorkDetail() {
    const { contractId, wallet } = useContext(WalletContext)
    const [work, setWork] = useState({})
    const [openModalAlert, setOpenModalAlert] = useState(false)
    const [openModalEdit, setOpenModalEdit] = useState(false)
    const [openModalLoading, setOpenModalLoading] = useState(false)
    const [openModalRating, setOpenModalRating] = useState(false)
    const [openModalRatingSuccess, setOpenModalRatingSuccess] = useState(false)
    const [isBtnLoading, setIsBtnLoading] = useState(false)
    const [workDueDateTime, setWorkDueDateTime] = useState('')
    const { state } = useLocation()

    useEffect(() => {
        setWork({ ...state?.work })
        // wallet
        //     .viewMethod({
        //         method: 'GetJob',
        //         args: {
        //             id: state?.work?.id,
        //         },
        //         contractId,
        //     })
        //     .then((res) => {
        //         console.log(res)
        //         setWork({ ...state?.work })
        //     })
    }, [])

    const payWorkHandler = (e) => {
        e.preventDefault()
        setOpenModalLoading(true)

        wallet
            .callMethod({
                method: 'VerifyPaymentRequest',
                args: {
                    id: work?.id,
                },
                contractId,
            })
            .then(async (res) => {
                console.log(res)
                setOpenModalAlert(true)
            })
    }

    const changeDueDateHandler = (e) => {
        e.preventDefault()
        setIsBtnLoading(true)
        const dateTime = e.target.elements[0].value + ' ' + e.target.elements[1].value + ':59'

        wallet
            .callMethod({
                method: 'SetJobDeadline',
                args: {
                    jobId: work.id,
                    deadline: new Date(dateTime).toISOString(),
                },
                contractId,
            })
            .then(async (res) => {
                console.log(res)
                setWorkDueDateTime(format(new Date(dateTime), 'iii, MMM do uuuu, kk:mm'))
                setIsBtnLoading(false)
                setOpenModalEdit(false)
            })
    }

    const rateFreelancerHandler = (e) => {
        e.preventDefault()
        const { commentRating, starRating } = e.target.elements

        wallet
            .callMethod({
                method: 'Evaluate',
                args: {
                    userId: work?.freelancer?.id,
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
                                                            <h5 className={cx('work-title')}>{work.title}</h5>
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
                                                                        work.status === '1'
                                                                            ? 'Processing'
                                                                            : work.status === '2' || work.status === '4'
                                                                            ? 'Pending'
                                                                            : 'Cancelled'
                                                                    ]
                                                                }
                                                                sx={{ fontSize: '1.4rem', p: '2px 10px' }}
                                                            >
                                                                {workStatusConvert(work.status)}
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
                                                        <Chip
                                                            variant="soft"
                                                            color="neutral"
                                                            size="lg"
                                                            sx={{ pointerEvents: 'none' }}
                                                        >
                                                            {work?.category}
                                                        </Chip>
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
                                            <h5 className={cx('work-price')}>{`Fixed price: $${work?.money}`}</h5>
                                        </Box>
                                    </Col>
                                </Row>
                                {work.status === 2 ? (
                                    <CardActions sx={{ gridColumn: '1/-1', mt: '24px' }}>
                                        <button className="cancel-btn btn rounded-pill btn-outline-style">
                                            Request to Redo
                                        </button>
                                        <button
                                            className="save-btn btn rounded-pill btn-primary-style"
                                            onClick={payWorkHandler}
                                        >
                                            Confirm and Pay
                                        </button>
                                    </CardActions>
                                ) : work.status === 3 || work.status === 4 ? (
                                    <CardActions sx={{ gridColumn: '1/-1', mt: '24px' }}>
                                        <button
                                            className="save-btn btn rounded-pill btn-primary-style"
                                            onClick={() => {
                                                setOpenModalRating(true)
                                            }}
                                        >
                                            Review freelancer
                                        </button>
                                    </CardActions>
                                ) : (
                                    <CardActions sx={{ gridColumn: '1/-1', mt: '24px' }}>
                                        <Button
                                            variant="outlined"
                                            size="lg"
                                            color="danger"
                                            startDecorator={<DeleteRegular />}
                                            type="submit"
                                        >
                                            Stop work
                                        </Button>
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
                                    <h5 className={cx('work-due')}>
                                        Due date: {workDueDateTime ? workDueDateTime : 'Sat, July 31 2023, 00:00'}
                                    </h5>
                                </Box>
                            </Box>
                            <CardContent>
                                <Typography fontSize="md">File draft</Typography>
                                <Typography level="body1">
                                    <a href="github.com">github.com</a>
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="outlined"
                                    color="neutral"
                                    startDecorator={<EditRegular />}
                                    onClick={() => {
                                        setOpenModalEdit(true)
                                    }}
                                >
                                    Change due
                                </Button>
                            </CardActions>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ModalAlert
                open={openModalAlert}
                setOpen={setOpenModalAlert}
                title="Payment Successfully"
                message="Wow! This was a long journey to have your work done by our talents. You've paid your bill successfuly."
                backPath={config.routes.proposalDashboard}
            />
            <ModalEdit
                open={openModalEdit}
                setOpen={setOpenModalEdit}
                title="Change due"
                message="Fill in the due date of the work."
                inputType="datetime"
                submitFormHandler={changeDueDateHandler}
            />
            <ModalLoading
                open={openModalLoading}
                setOpen={setOpenModalLoading}
                isLoading={isBtnLoading}
                title="Sending"
                message="We are preparing your work to be published."
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
                submitFormHandler={rateFreelancerHandler}
            />
        </div>
    )
}

export default WorkDetail

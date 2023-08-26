import { Fragment, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardActions from '@mui/joy/CardActions'
import CardContent from '@mui/joy/CardContent'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input'
import Textarea from '@mui/joy/Textarea'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Avatar from '@mui/joy/Avatar'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { DeleteRegular } from '@fluentui/react-icons'

import { WalletContext } from '../../App'
import Banner from '../../pages/components/Banner'
import ErrorMessage from '../../pages/components/ErrorMessage'
import ModalAlert from '../../pages/components/ModalAlert'
import ModalLoading from '../../pages/components/ModalLoading'
import config from '../../config'
import { axiosInstance } from '../../utils/axiosInstance'
import styles from './CreateWork.module.scss'

const cx = classNames.bind(styles)

function CreateWork() {
    const { contractId, wallet } = useContext(WalletContext)
    const [currency, setCurrency] = useState('dollar')
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openUpdateModal, setOpenUpdateModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [openModalCreateLoading, setOpenModalCreateLoading] = useState(false)
    const [openModalUpdateLoading, setOpenModalUpdateLoading] = useState(false)
    const [openModalDeleteLoading, setOpenModalDeleteLoading] = useState(false)
    const [error, setError] = useState({ status: false, message: '' })

    const { state } = useLocation()

    const createWorkHandler = async (e) => {
        e.preventDefault()
        setOpenModalCreateLoading(true)
        const { workTitle, workCategory, workDesc, workDue, workBudget } = e.target.elements
        const data = {
            title: workTitle.value,
            description: workDesc.value,
            categories: workCategory.value.split(","),
            money: workBudget.value,
        }

        await axiosInstance({
            method: 'POST',
            url: 'job',
            data: data,
            headers: {
                Authorization: wallet.accountId,
            },
        })
            .then(async (res) => {
                if (res.data.status) {
                    await wallet.callMethod({
                        method: 'CreateJob',
                        args: data,
                        contractId,
                    })
                    setError({ status: false })
                    setOpenCreateModal(true)
                } else {
                    setError({ status: true, message: res?.data?.message })
                }
            })
            .catch((res) => {
                console.log(res)
                setError({ status: true, message: res?.message })
            })
            .finally(() => {
                setOpenModalCreateLoading(false)
            })
    }

    const updateWorkHandler = async (e) => {
        e.preventDefault()
        setOpenModalUpdateLoading(true)
        const { workTitleUpdate, workDescUpdate, workDueUpdate, workBudgetUpdate } = e.target.elements
        const data = {
            id: state?.work?.id,
            title: workTitleUpdate.value,
            description: workDescUpdate.value,
            categories: [...state?.work?.categories],
            money: workBudgetUpdate.value,
        }

        await axiosInstance({
            method: 'PUT',
            url: `job/${data.id}`,
            data: {
                title: data.title,
                description: data.description,
                categories: [...data.categories],
                money: data.money,
            },
            headers: {
                Authorization: wallet.accountId,
            },
        })
            .then(async (res) => {
                if (res.data.status) {
                    await wallet.callMethod({
                        method: 'UpdateJob',
                        args: data,
                        contractId,
                    })
                    setError({ status: false })
                } else {
                    setError({ status: true, message: res?.data?.message })
                }
            })
            .catch((res) => {
                console.log(res)
                setError({ status: true, message: res?.message })
            })
            .finally(() => {
                setOpenModalUpdateLoading(false)
                setOpenUpdateModal(true)
            })
    }

    const deleteWorkHandler = async (e) => {
        console.log(state?.work?.id)
        e.preventDefault()
        setOpenModalDeleteLoading(true)
        const workId = state?.work?.id

        await axiosInstance({
            method: 'DELETE',
            url: `job/${workId}`,
            headers: {
                Authorization: wallet.accountId,
            },
        })
            .then(async (res) => {
                if (res.data.status) {
                    await wallet.callMethod({
                        method: 'DeleteJob',
                        args: {
                            id: workId,
                        },
                        contractId,
                    })
                    setError({ status: false })
                } else {
                    setError({ status: true, message: res?.data?.message })
                }
            })
            .catch((res) => {
                console.log(res)
                setError({ status: true, message: res?.message })
            })
            .finally(() => {
                setOpenModalDeleteLoading(false)
                setOpenDeleteModal(true)
            })
    }

    return (
        <div>
            <Box>
                <Container>
                    <Row>
                        {/* Banner */}
                        <Col xs={12} className={cx('banner-wrapper')}>
                            <Banner title="Post New Work" />
                        </Col>

                        {/* Create job form */}
                        <Col xs={12} lg={8}>
                            {state?.type === 'create' ? (
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
                                    <h3 className={cx('form-title')}>About the work</h3>
                                    <Divider insert="none" />
                                    <form onSubmit={createWorkHandler}>
                                        <CardContent
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                                gap: 1.5,
                                            }}
                                        >
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel sx={{ my: '12px' }}>
                                                    Give your project brief a title
                                                </FormLabel>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workTitle',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your work's category?</FormLabel>
                                                <FormHelperText>"Use comma (,) to separate each category"</FormHelperText>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workCategory',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What are you looking to get done?</FormLabel>
                                                <Textarea
                                                    slotProps={{
                                                        textarea: {
                                                            name: 'workDesc',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your timeline?</FormLabel>
                                                <Input
                                                    type="date"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDue',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your budget?</FormLabel>
                                                <Input
                                                    placeholder="Amount"
                                                    startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[currency]}
                                                    endDecorator={
                                                        <Fragment>
                                                            <Divider orientation="vertical" />
                                                            <Select
                                                                variant="plain"
                                                                value={currency}
                                                                onChange={(_, value) => setCurrency(value)}
                                                                sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                            >
                                                                <Option value="dollar">US dollar</Option>
                                                                <Option value="baht">Thai baht</Option>
                                                                <Option value="yen">Japanese yen</Option>
                                                            </Select>
                                                        </Fragment>
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            name: 'workBudget',
                                                        },
                                                    }}
                                                    required
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>Attach Files</FormLabel>
                                                <Input
                                                    type="file"
                                                    slotProps={{
                                                        input: {
                                                            name: 'work-attachments',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <CardActions sx={{ gridColumn: '1/-1', my: '24px' }}>
                                                <button
                                                    className="btn rounded-pill btn-primary-style w-100 fw-bold"
                                                    type="submit"
                                                >
                                                    Save and Post
                                                </button>
                                            </CardActions>
                                            {error.status && <ErrorMessage message={error.message} />}
                                        </CardContent>
                                    </form>
                                </Card>
                            ) : (
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            my: 1,
                                            gap: 1,
                                            flexWrap: 'wrap',
                                            '& > *': {
                                                minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
                                                flexGrow: 1,
                                            },
                                        }}
                                    >
                                        <h3 className={cx('form-title')}>Update the work</h3>
                                        <Box sx={{ flex: 999 }} />
                                        <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
                                            <form onSubmit={deleteWorkHandler}>
                                                <Button
                                                    variant="outlined"
                                                    size="lg"
                                                    color="danger"
                                                    startDecorator={<DeleteRegular />}
                                                    type="submit"
                                                >
                                                    Delete job
                                                </Button>
                                            </form>
                                        </Box>
                                    </Box>
                                    <Divider insert="none" />
                                    <form onSubmit={updateWorkHandler}>
                                        <CardContent
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                                gap: 1.5,
                                            }}
                                        >
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel className={cx('fo')} sx={{ my: '12px' }}>
                                                    Give your project brief a title
                                                </FormLabel>
                                                <Input
                                                    slotProps={{
                                                        input: {
                                                            name: 'workTitleUpdate',
                                                            value: state?.work?.title,
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What are you looking to get done?</FormLabel>
                                                <Textarea
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDescUpdate',
                                                            value: state?.work?.description,
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your timeline?</FormLabel>
                                                <Input
                                                    type="date"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workDueUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>What is your budget?</FormLabel>
                                                <Input
                                                    placeholder="Amount"
                                                    startDecorator={{ dollar: '$', baht: '฿', yen: '¥' }[currency]}
                                                    endDecorator={
                                                        <Fragment>
                                                            <Divider orientation="vertical" />
                                                            <Select
                                                                variant="plain"
                                                                value={currency}
                                                                onChange={(_, value) => setCurrency(value)}
                                                                sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                            >
                                                                <Option value="dollar">US dollar</Option>
                                                                <Option value="baht">Thai baht</Option>
                                                                <Option value="yen">Japanese yen</Option>
                                                            </Select>
                                                        </Fragment>
                                                    }
                                                    slotProps={{
                                                        input: {
                                                            name: 'workBudgetUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl sx={{ gridColumn: '1/-1' }}>
                                                <FormLabel>Attach Files</FormLabel>
                                                <Input
                                                    type="file"
                                                    slotProps={{
                                                        input: {
                                                            name: 'workAttachmentsUpdate',
                                                        },
                                                    }}
                                                />
                                            </FormControl>
                                            <CardActions sx={{ gridColumn: '1/-1', my: '24px' }}>
                                                <button
                                                    className="btn rounded-pill btn-primary-style w-100 fw-bold"
                                                    type="submit"
                                                >
                                                    Update work
                                                </button>
                                            </CardActions>
                                            {error.status && <ErrorMessage message={error.message} />}
                                        </CardContent>
                                    </form>
                                </Card>
                            )}
                        </Col>
                        <Col xs={12} lg={4}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                }}
                            >
                                <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                                    <Avatar src="/static/images/avatar/1.jpg" sx={{ '--Avatar-size': '4rem' }} />
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        color="primary"
                                        sx={{ mt: -1, border: '3px solid', borderColor: 'background.surface' }}
                                    >
                                        PRO
                                    </Chip>
                                    <Typography fontSize="lg" fontWeight="lg" sx={{ mt: 1, mb: 0.5 }}>
                                    {wallet.accountId}
                                    </Typography>
                                    <Typography level="body2" sx={{ maxWidth: '24ch' }}>
                                        Hello, this is my bio and I am a PRO member of Freelance dApp. I am a developer
                                        and I love to code.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Box>
            <ModalAlert
                open={openCreateModal}
                setOpen={setOpenCreateModal}
                message="You've posted new work successfully. Be patient to wait potential clients."
                backPath={config.routes.workDashboard}
            />
            <ModalAlert
                open={openUpdateModal}
                setOpen={setOpenUpdateModal}
                title="Update Successfully"
                message="You've updated your work successfully. Be patient to wait potential clients."
                backPath={config.routes.workDashboard}
            />
            <ModalAlert
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                title="Update Successfully"
                message="You've just deleted your work. Hope to see your new work soon."
                backPath={config.routes.workDashboard}
            />
            <ModalLoading
                open={openModalCreateLoading}
                setOpen={setOpenModalCreateLoading}
                title="Posting"
                message="We are preparing your work to be published."
            />
            <ModalLoading
                open={openModalUpdateLoading}
                setOpen={setOpenModalUpdateLoading}
                title="Updating"
                message="We are preparing your work to be updated."
            />
            <ModalLoading
                open={openModalDeleteLoading}
                setOpen={setOpenModalDeleteLoading}
                title="Deleting"
                message="We are preparing your work to be removed."
            />
        </div>
    )
}

export default CreateWork

import { Fragment, useState, useEffect, useContext } from 'react'
import { Link as LinkRoute } from 'react-router-dom'
import format from 'date-fns/format'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Link from '@mui/joy/Link'
import Input from '@mui/joy/Input'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import ModalClose from '@mui/joy/ModalClose'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Table from '@mui/joy/Table'
import Sheet from '@mui/joy/Sheet'
import Checkbox from '@mui/joy/Checkbox'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import {
    ArrowLeftRegular,
    ArrowRightRegular,
    ArrowDownRegular,
    CheckmarkRegular,
    DismissRegular,
    ArrowStepBackRegular,
    EditRegular,
    EyeRegular,
} from '@fluentui/react-icons'

import { WalletContext } from '../../../App'
import { axiosInstance } from '../../../utils/axiosInstance'
import config from '../../../config'

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0])
        if (order !== 0) {
            return order
        }
        return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
}

function WorksTable() {
    const { contractId, wallet, userId } = useContext(WalletContext)
    const [workList, setWorkList] = useState([])
    const [order, setOrder] = useState('desc')
    const [selected, setSelected] = useState([])
    const [openFilter, setOpenFilter] = useState(false)

    console.log(userId)

    useEffect(() => {
        ;(async () => {
            await axiosInstance({
                method: 'GET',
                url: `job?_filter=creatorId:${userId}&_fields=title,description,categories,money,creatorId,status,freelancerId,startedAt,finishedAts,deadline,createdAt&_noPagination=1`,
            })
                .then((res) => {
                    if (res.data.status) {
                        setWorkList([...res.data.data])
                    }
                    console.log(res)
                })
                .catch((res) => {
                    console.log(res)
                })
        })()
    }, [])

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

    const renderFilters = () => (
        <Fragment>
            <FormControl size="sm">
                <FormLabel>Status</FormLabel>
                <Select
                    placeholder="Filter by status"
                    slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                    sx={{ py: 0 }}
                >
                    <Option value="paid">Paid</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="refunded">Refunded</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            </FormControl>

            <FormControl size="sm">
                <FormLabel>Category</FormLabel>
                <Select placeholder="All" sx={{ py: 0 }}>
                    <Option value="all">All</Option>
                </Select>
            </FormControl>

            <FormControl size="sm">
                <FormLabel>Customer</FormLabel>
                <Select placeholder="All" sx={{ py: 0 }}>
                    <Option value="all">All</Option>
                </Select>
            </FormControl>
        </Fragment>
    )

    return (
        <Fragment>
            <Sheet
                className="SearchAndFilters-mobile"
                sx={{
                    display: {
                        xs: 'flex',
                        sm: 'none',
                    },
                    my: 1,
                    gap: 1,
                }}
            >
                <Input
                    size="sm"
                    placeholder="Search"
                    startDecorator={<i data-feather="search" />}
                    sx={{ flexGrow: 1 }}
                />
                <IconButton size="sm" variant="outlined" color="neutral" onClick={() => setOpenFilter(true)}>
                    <i data-feather="filter" />
                </IconButton>
                <Modal open={openFilter} onClose={() => setOpenFilter(false)}>
                    <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
                        <ModalClose />
                        <Typography id="filter-modal" level="h2">
                            Filters
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {renderFilters()}
                            <Button color="primary" onClick={() => setOpenFilter(false)}>
                                Submit
                            </Button>
                        </Sheet>
                    </ModalDialog>
                </Modal>
            </Sheet>
            <Box
                className="SearchAndFilters-tabletUp"
                sx={{
                    borderRadius: 'sm',
                    py: 2,
                    display: {
                        xs: 'none',
                        sm: 'flex',
                    },
                    flexWrap: 'wrap',
                    gap: 1.5,
                    '& > *': {
                        minWidth: {
                            xs: '120px',
                            md: '160px',
                        },
                    },
                }}
            >
                <FormControl sx={{ flex: 1 }} size="sm">
                    <FormLabel>Search for work</FormLabel>
                    <Input placeholder="Search" startDecorator={<i data-feather="search" />} />
                </FormControl>

                {renderFilters()}
            </Box>
            <Sheet
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: 'md',
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                <Table
                    aria-labelledby="tableTitle"
                    stickyHeader
                    hoverRow
                    sx={{
                        '--TableCell-headBackground': (theme) => theme.vars.palette.background.level1,
                        '--Table-headerUnderlineThickness': '1px',
                        '--TableRow-hoverBackground': (theme) => theme.vars.palette.background.level1,
                        fontSize: '1.2rem',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: 48, textAlign: 'center', padding: 12 }}>
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length !== workList.length}
                                    checked={selected.length === workList.length}
                                    onChange={(event) => {
                                        setSelected(event.target.checked ? workList.map((work) => work.id) : [])
                                    }}
                                    color={
                                        selected.length > 0 || selected.length === workList.length
                                            ? 'primary'
                                            : undefined
                                    }
                                    sx={{ verticalAlign: 'text-bottom' }}
                                />
                            </th>
                            <th style={{ width: 140, padding: 12 }}>
                                <Link
                                    underline="none"
                                    component="button"
                                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                    fontWeight="lg"
                                    endDecorator={<ArrowDownRegular />}
                                    sx={{
                                        '& svg': {
                                            transition: '0.2s',
                                            transform: order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                        },
                                        color: 'hsl(244, 100%, 50%)',
                                    }}
                                >
                                    Work
                                </Link>
                            </th>
                            <th style={{ width: 120, padding: 12 }}>Created Date</th>
                            <th style={{ width: 120, padding: 12 }}>Status</th>
                            <th style={{ width: 120, padding: 12 }}>Due Date</th>
                            <th style={{ width: 200, padding: 12 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stableSort(workList, getComparator(order, 'title')).map((work) => (
                            <tr key={work.id}>
                                <td style={{ textAlign: 'center' }}>
                                    <Checkbox
                                        checked={selected.includes(work.id)}
                                        color={selected.includes(work.id) ? 'primary' : undefined}
                                        onChange={(event) => {
                                            setSelected((ids) =>
                                                event.target.checked
                                                    ? ids.concat(work.id)
                                                    : ids.filter((itemId) => itemId !== work.id),
                                            )
                                        }}
                                        slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                                        sx={{ verticalAlign: 'text-bottom' }}
                                    />
                                </td>
                                <td>
                                    <LinkRoute
                                        to={
                                            'freelancerId' in work && !!work.freelancerId
                                                ? config.routes.workDetail
                                                : config.routes.workProposals
                                        }
                                    >
                                        <Typography fontWeight="md">{work.title}</Typography>
                                    </LinkRoute>
                                </td>
                                <td>{work?.createdAt ? format(new Date(work.createdAt), 'PP') : 'Aug 26, 2023'}</td>
                                <td>
                                    <Chip
                                        variant="soft"
                                        size="sm"
                                        startDecorator={
                                            {
                                                Paid: <CheckmarkRegular />,
                                                Processing: <ArrowStepBackRegular />,
                                                Cancelled: <DismissRegular />,
                                            }[
                                                work.status === 4
                                                    ? 'Paid'
                                                    : work.status === 1 || work.status === 2
                                                    ? 'Processing'
                                                    : 'Cancelled'
                                            ]
                                        }
                                        color={
                                            {
                                                Paid: 'success',
                                                Processing: 'neutral',
                                                Cancelled: 'danger',
                                            }[
                                                work.status === 4
                                                    ? 'Paid'
                                                    : work.status === 1 || work.status === 2
                                                    ? 'Processing'
                                                    : 'Cancelled'
                                            ]
                                        }
                                        sx={{ fontSize: '1.2rem' }}
                                    >
                                        {workStatusConvert(work.status)}
                                    </Chip>
                                </td>
                                <td>{work?.deadline ? format(new Date(work.deadline), 'PP') : 'Not set'}</td>
                                <td>
                                    <LinkRoute
                                        to={
                                            'freelancerId' in work && !!work.freelancerId
                                                ? config.routes.workDetail
                                                : config.routes.workProposals
                                        }
                                        state={{ work: work }}
                                    >
                                        <Link
                                            fontWeight="lg"
                                            component="button"
                                            color="neutral"
                                            sx={{ ml: 2 }}
                                            startDecorator={<EyeRegular />}
                                        >
                                            View
                                        </Link>
                                    </LinkRoute>
                                    <LinkRoute to={config.routes.createWork} state={{ type: 'modify', work: work }}>
                                        <Link
                                            fontWeight="lg"
                                            component="button"
                                            color="neutral"
                                            sx={{ ml: 2 }}
                                            startDecorator={<EditRegular />}
                                        >
                                            Edit/Delete
                                        </Link>
                                    </LinkRoute>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>
            <Box className="Pagination-mobile" sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                <IconButton aria-label="previous page" variant="outlined" color="neutral" size="sm">
                    <i data-feather="arrow-left" />
                </IconButton>
                <Typography level="body2" mx="auto">
                    Page 1 of 10
                </Typography>
                <IconButton aria-label="next page" variant="outlined" color="neutral" size="sm">
                    <i data-feather="arrow-right" />
                </IconButton>
            </Box>
            <Box
                className="Pagination-laptopUp"
                sx={{
                    pt: 4,
                    gap: 1,
                    display: {
                        xs: 'none',
                        md: 'flex',
                    },
                }}
            >
                <Button size="md" variant="plain" color="neutral" startDecorator={<ArrowLeftRegular />}>
                    Previous
                </Button>

                <Box sx={{ flex: 1 }} />
                {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
                    <IconButton key={page} size="sm" variant={Number(page) ? 'outlined' : 'plain'} color="neutral">
                        {page}
                    </IconButton>
                ))}
                <Box sx={{ flex: 1 }} />

                <Button size="md" variant="plain" color="neutral" endDecorator={<ArrowRightRegular />}>
                    Next
                </Button>
            </Box>
        </Fragment>
    )
}

export default WorksTable

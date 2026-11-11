import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useMemo } from 'react'
import { PowerSyncContext } from '@powersync/react'
import { useSuspenseQuery } from '@powersync/tanstack-react-query'

import type { CommonPowerSyncDatabase, PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/web';
export const Route = createFileRoute('/_layout/power_sync')({
    component: RouteComponent,
})
import { column, PowerSyncDatabase, Schema, Table } from '@powersync/web';

// 对应 MySQL digua_dev.`order`（注意 id 是主键，PowerSync 自动管理，不要在此声明）
const order = new Table(
    {
        order_number: column.text,
        user_id: column.text
    },
    // by_user 流按 user_id 过滤，本地查询也常按用户取订单，加索引
    { indexes: { by_user: ['user_id'] } }
);

// 对应 MySQL digua_dev.order_details
const order_details = new Table(
    {
        order_id: column.integer,
        product_name: column.text
    },
    // 明细按订单查询，索引 order_id
    { indexes: { by_order: ['order_id'] } }
);

export const AppSchema = new Schema({
    order,
    order_details
});

export type Database = typeof AppSchema;

export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'powersync.db'
    },
});



class Connector implements PowerSyncBackendConnector {
    async fetchCredentials(): Promise<PowerSyncCredentials> {
        // 开发阶段：自托管服务地址 + generate token 签出的开发令牌，均从环境变量读取
        return {
            endpoint: import.meta.env.VITE_POWERSYNC_URL ?? 'http://localhost:8080',
            token: import.meta.env.VITE_POWERSYNC_TOKEN ?? ''
        };
    }

    async uploadData(database: CommonPowerSyncDatabase) {
        const transaction = await database.getNextCrudTransaction();
        if (!transaction) return;

        // for (const op of transaction.crud) {
        //     const record = { ...op.opData, id: op.id };
        //     // upload to your backend API
        // }

        await transaction.complete();
    }
}

// connect the database to PowerSync Service
const connector = new Connector();
await db.connect(connector);

interface OrderDetail {
    detail_id: number
    product_name: string
}

interface OrderRow {
    id: number
    order_number: string
    user_id: string
    details: OrderDetail[]
}

// JOIN 返回的扁平行：同一订单按明细条数重复多行（无明细时 detail 列为 null）
interface FlatRow {
    order_id: number
    order_number: string
    user_id: string
    detail_id: number | null
    product_name: string | null
}

// 联表 SQL：order 是保留字必须加引号；LEFT JOIN 保证无明细的订单也出现
const ORDERS_SQL =
    'SELECT o.id AS order_id, o.order_number, o.user_id, ' +
    'd.id AS detail_id, d.product_name ' +
    'FROM "order" o ' +
    'LEFT JOIN order_details d ON d.order_id = o.id ' +
    'ORDER BY o.id, d.id';

// 真正渲染的组件：useSuspenseQuery 泛型是“行类型”，data 已是 FlatRow[]
function OrdersView() {
    // queryKey 必填（TanStack 缓存键）；泛型是行类型 FlatRow，data 即 FlatRow[]
    const { data: rows } = useSuspenseQuery<FlatRow>({
        queryKey: ['power_sync', 'orders'],
        query: ORDERS_SQL
    });

    // 扁平 JOIN 结果按订单分组成嵌套结构
    const orders = useMemo<OrderRow[]>(() => {
        const map = new Map<number, OrderRow>();
        for (const r of rows) {
            let order = map.get(r.order_id);
            if (!order) {
                order = { id: r.order_id, order_number: r.order_number, user_id: r.user_id, details: [] };
                map.set(r.order_id, order);
            }
            if (r.detail_id != null) {
                order.details.push({ detail_id: r.detail_id, product_name: r.product_name ?? '' });
            }
        }
        return [...map.values()];
    }, [rows]);

    return (
        <div>
            <h1>订单（PowerSync 实时同步）— 共 {orders.length} 条</h1>
            <ul>
                {orders.map((o) => (
                    <li key={o.id}>
                        {o.id} - {o.order_number} - user: {o.user_id}
                        <ul>
                            {o.details.length === 0
                                ? <li>（无明细）</li>
                                : o.details.map((d) => (
                                    <li key={d.detail_id}>{d.product_name}</li>
                                ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function RouteComponent() {
    // useSuspenseQuery 通过 usePowerSync() 从 context 取 db，故本地包一层 PowerSyncContext
    return (
        <PowerSyncContext.Provider value={db}>
            <Suspense fallback={<p>同步中…</p>}>
                <OrdersView />
            </Suspense>
        </PowerSyncContext.Provider>
    );
}

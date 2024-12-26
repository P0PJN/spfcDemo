import * as React from "react";

import { Menu, } from "antd";
import type { MenuProps } from "antd";

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        label: 'Science',
        key: 'SubMenu',
        children: [
            {
                label: 'science fiction',
                key: 'science fiction',
            },
            {
                label: 'experimental science',
                key: 'experimental science',
            },
        ],
    },
    {
        label: 'agriculture',
        key: 'SubMenu',
        children: [
            {
                label: 'farm produce',
                key: 'farm produce',
            },
            {
                label: 'wheat',
                key: 'wheat',
            },
        ],
    },
]

const MenuTest: React.FC = () => {

    return (
        <>
            <Menu
                items={items}
            />
        </>
    );
};

export default MenuTest;
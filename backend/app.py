from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)
@app.route('/', methods=['GET'])
def ping():
    return "B-Tree Server still alive"

class BTreeNode:
    def __init__(self, leaf=True):
        self.keys = []
        self.children = []
        self.leaf = leaf
        self.id = str(uuid.uuid4())[:8]

    def to_dict(self):
        return {
            "id": self.id,
            "keys": self.keys,
            "leaf": self.leaf,
            "children": [c.to_dict() for c in self.children]
        }

class BTree:
    def __init__(self):
        self.root = BTreeNode()

    def _is_less(self, a, b):
        try: return int(a) < int(b)
        except: return str(a) < str(b)

    def insert(self, key):
        split_res = self._insert_rec(self.root, key)
        if split_res:
            new_root = BTreeNode(leaf=False)
            new_root.keys.append(split_res['promoted_key'])
            new_root.children.extend([self.root, split_res['new_node']])
            self.root = new_root

    def _insert_rec(self, node, key):
        if node.leaf:
            node.keys.append(key)
            node.keys.sort(key=lambda x: (int(x) if x.isdigit() else x))
            if len(node.keys) > 2: return self._split(node)
            return None
        else:
            i = 0
            while i < len(node.keys) and not self._is_less(key, node.keys[i]): 
                if str(key) == str(node.keys[i]): break # Không cho trùng lặp
                i += 1
            split_res = self._insert_rec(node.children[i], key)
            if split_res:
                node.keys.insert(i, split_res['promoted_key'])
                node.children.insert(i + 1, split_res['new_node'])
                if len(node.keys) > 2: return self._split(node)
            return None

    def _split(self, node):
        promoted_key = node.keys[1]
        new_node = BTreeNode(leaf=node.leaf)
        new_node.keys.append(node.keys[2])
        node.keys = [node.keys[0]]
        if not node.leaf:
            new_node.children.extend([node.children[2], node.children[3]])
            node.children = [node.children[0], node.children[1]]
        return {'promoted_key': promoted_key, 'new_node': new_node}

    def search_path(self, key):
        path = []
        node = self.root
        while node:
            path.append(node.id)
            i = 0
            while i < len(node.keys) and self._is_less(node.keys[i], key):
                i += 1
            if i < len(node.keys) and str(node.keys[i]) == str(key):
                return path, True
            if node.leaf:
                break
            node = node.children[i]
        return path, False

    def get_all_keys(self):
        def _get(node):
            res = []
            if not node: return res
            for i in range(len(node.keys)):
                if not node.leaf: res.extend(_get(node.children[i]))
                res.append(node.keys[i])
            if not node.leaf: res.extend(_get(node.children[-1]))
            return res
        return _get(self.root)

    def delete(self, key):
        keys = self.get_all_keys()
        str_keys = [str(k) for k in keys]
        if str(key) in str_keys:
            idx = str_keys.index(str(key))
            del keys[idx]
            # Tái tạo lại cây
            self.root = BTreeNode()
            for k in keys: self.insert(k)
            return True
        return False

btree = BTree()

@app.route('/api/insert', methods=['POST'])
def insert_student():
    ma_sv = request.json.get('id')
    btree.insert(ma_sv)
    return jsonify({"status": "success", "message": f"Đã thêm <strong>{ma_sv}</strong>", "tree": btree.root.to_dict()})

@app.route('/api/search', methods=['POST'])
def search_student():
    ma_sv = request.json.get('id')
    path, found = btree.search_path(ma_sv)
    return jsonify({"status": "success", "path": path, "found": found})

@app.route('/api/delete', methods=['POST'])
def delete_student():
    ma_sv = request.json.get('id')
    success = btree.delete(ma_sv)
    if success:
        return jsonify({"status": "success", "message": f"Đã xóa <strong>{ma_sv}</strong>", "tree": btree.root.to_dict()})
    return jsonify({"status": "error", "message": "Không tìm thấy mã SV"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)